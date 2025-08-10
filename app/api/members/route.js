

// =====  app/api/members/route.js =====

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '../../../lib/telegram.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// توليد رمز تحقق آمن
function generateVerificationCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 أحرف
}

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

    console.log(`📝 إنشاء عضوية جديدة للمستخدم ${telegramId} في القناة ${channel.name}`);

    // توليد رمز تحقق فريد
    const verificationCode = generateVerificationCode();

    // إنشاء رابط دعوة شخصي
    const inviteLinkResult = await bot.createPersonalizedInviteLink(
      channel.telegramId,
      telegramId,
      minutes + 5
    );

    if (!inviteLinkResult.success) {
      return NextResponse.json({ 
        error: `فشل في إنشاء رابط الدعوة: ${inviteLinkResult.error}` 
      }, { status: 500 });
    }

    // حفظ العضو في قاعدة البيانات
    const member = await prisma.member.create({
      data: {
        telegramId,
        username,
        firstName,
        lastName,
        channelId,
        kickDate: new Date(kickDate),
        inviteLink: inviteLinkResult.invite_link,
        uniqueToken: verificationCode, // حفظ رمز التحقق
        hasJoined: false,
        tokenUsed: false
      }
    });

    // إرسال الرابط مع رمز التحقق للمستخدم
    const sendResult = await bot.sendSecureInvite(
      telegramId,
      channel.name,
      inviteLinkResult.invite_link,
      verificationCode,
      minutes || 5
    );

    console.log(`✅ تم إنشاء دعوة محمية للمستخدم ${telegramId}`);

    return NextResponse.json({
      member,
      message: sendResult.success 
        ? 'تم إرسال الدعوة المحمية بنجاح!' 
        : `تم إنشاء الدعوة لكن فشل الإرسال: ${sendResult.error}`
    });

  } catch (error) {
    console.error('خطأ في إضافة العضو:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

