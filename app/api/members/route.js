// ===== 3. تحديث app/api/members/route.js =====
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

    // التحقق من عدم وجود عضوية نشطة
    const existingMember = await prisma.member.findFirst({
      where: {
        telegramId,
        channelId,
        isActive: true
      }
    });

    if (existingMember) {
      return NextResponse.json({
        error: 'المستخدم لديه عضوية نشطة بالفعل'
      }, { status: 400 });
    }

    console.log(`📝 إنشاء عضوية آمنة للمستخدم ${telegramId}`);

    // إنشاء رابط دعوة آمن مع طلب الموافقة
    const inviteLinkResult = await bot.createSecureInviteLink(
      channel.telegramId,
      telegramId,
      minutes || 5
    );

    if (!inviteLinkResult.success) {
      return NextResponse.json({
        error: `فشل في إنشاء الرابط: ${inviteLinkResult.error}`
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
        hasJoined: false,
        isActive: true
      }
    });

    // إرسال الرابط للمستخدم
    const sendResult = await bot.sendSecureInvite(
      telegramId,
      channel.name,
      inviteLinkResult.invite_link,
      minutes || 5
    );

    console.log(`✅ تم إنشاء دعوة آمنة للمستخدم ${telegramId}`);

    return NextResponse.json({
      member,
      message: sendResult.success
        ? 'تم إرسال الدعوة الآمنة بنجاح!'
        : `تم إنشاء الدعوة لكن فشل الإرسال: ${sendResult.error}`
    });
  } catch (error) {
    console.error('خطأ في إضافة العضو:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}