// ===== إصلاح app/api/members/route.js - مشكلة المدة =====

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '../../../lib/telegram.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { telegramId, channelId, kickDate, username, firstName, lastName, minutes } = await request.json();

    // التحقق من وجود القناة
    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      return NextResponse.json({ error: 'القناة غير موجودة' }, { status: 404 });
    }

    // التحقق من عدم وجود عضوية نشطة لنفس المستخدم
    const existingMember = await prisma.member.findFirst({
      where: {
        telegramId,
        channelId,
        isActive: true
      }
    });

    if (existingMember) {
      return NextResponse.json({
        error: 'المستخدم لديه عضوية نشطة بالفعل في هذه القناة'
      }, { status: 400 });
    }

    console.log(`📝 إنشاء عضوية آمنة للمستخدم ${telegramId} في القناة ${channel.name}`);
    console.log(`⏰ المدة المطلوبة: ${minutes} دقيقة`);

    // إنشاء رابط دعوة محمي - استخدام المدة الفعلية بدون إضافات
    const linkExpiryMinutes = minutes || 1; // إذا لم تُحدد، استخدم 5 دقائق
    
    const inviteLinkResult = await bot.createPersonalizedInviteLink(
      channel.telegramId,
      telegramId,
      linkExpiryMinutes // استخدام المدة الفعلية بدون إضافة +5
    );

    if (!inviteLinkResult.success) {
      return NextResponse.json({
        error: `فشل في إنشاء رابط الدعوة: ${inviteLinkResult.error}`
      }, { status: 500 });
    }

    console.log(`🔗 تم إنشاء رابط صالح لمدة: ${linkExpiryMinutes} دقيقة`);

    // حفظ العضو في قاعدة البيانات
    const member = await prisma.member.create({
      data: {
        telegramId, // هذا هو المفتاح الأمني - فقط هذا الشخص يمكنه الدخول
        username,
        firstName,
        lastName,
        channelId,
        kickDate: new Date(kickDate),
        inviteLink: inviteLinkResult.invite_link,
        hasJoined: false
      }
    });

    // إرسال الرابط مع المدة الصحيحة
    const sendResult = await bot.sendSecureInviteWithWarnings(
      telegramId,
      channel.name,
      inviteLinkResult.invite_link,
      linkExpiryMinutes // استخدام نفس المدة
    );

    console.log(`✅ تم إنشاء دعوة محمية للمستخدم ${telegramId} لمدة ${linkExpiryMinutes} دقيقة`);

    return NextResponse.json({
      member,
      linkExpiryMinutes: linkExpiryMinutes,
      membershipDuration: minutes,
      message: sendResult.success
        ? `تم إرسال الدعوة المحمية! الرابط صالح لمدة ${linkExpiryMinutes} دقيقة`
        : `تم إنشاء الدعوة لكن فشل الإرسال: ${sendResult.error}`,
      security_note: `الرابط مخصص حصرياً للمستخدم ${telegramId} فقط`
    });

  } catch (error) {
    console.error('خطأ في إضافة العضو:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        channel: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('خطأ في جلب الأعضاء:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}