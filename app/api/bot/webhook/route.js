import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '../../../../lib/telegram.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const update = await request.json();
    console.log('📨 Webhook update:', JSON.stringify(update, null, 2));

    // معالجة الأعضاء الجدد
    if (update.message && update.message.new_chat_members) {
      await handleNewMembers(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ خطأ في webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// معالجة الأعضاء الجدد
async function handleNewMembers(message) {
  const chatId = message.chat.id.toString();
  const newMembers = message.new_chat_members;

  for (const newMember of newMembers) {
    if (newMember.is_bot) continue;

    const userId = newMember.id.toString();
    console.log(`👤 عضو جديد انضم: ${userId} في القناة ${chatId}`);

    try {
      // جلب العضو المصرح له من قاعدة البيانات
      const member = await prisma.member.findFirst({
        where: {
          channel: { telegramId: chatId },
          isActive: true
        },
        include: { channel: true }
      });

      if (!member) {
        console.log(`❌ لا يوجد أي عضو مصرح لهذه القناة`);
        await kickUnauthorized(chatId, userId);
        continue;
      }

      // التحقق من أن الشخص الذي انضم هو نفس المصرح له
      if (member.telegramId !== userId) {
        console.log(`🚫 شخص غير مصرح (${userId}) حاول الدخول بدل ${member.telegramId}`);
        await kickUnauthorized(chatId, userId);
        continue;
      }

      // إذا كان الشخص صحيح → تحديث حالة الانضمام
      console.log(`✅ عضو مصرح له: ${userId}`);
      await prisma.member.update({
        where: { id: member.id },
        data: { hasJoined: true }
      });

      // إلغاء رابط الدعوة فوراً
      if (member.inviteLink) {
        console.log(`🔒 إلغاء رابط الدعوة للمستخدم ${userId}`);
        await bot.revokeInviteLink(member.channel.telegramId, member.inviteLink);
        await prisma.member.update({
          where: { id: member.id },
          data: { inviteLink: null }
        });
      }

      // رسالة ترحيب
      try {
        await bot.sendMessage(userId, `
🎉 **مرحباً بك في ${member.channel.name}!**

📅 مدة عضويتك تنتهي في: ${new Date(member.kickDate).toLocaleString('ar-EG')}
🔒 تم إلغاء رابط الدعوة نهائياً.
        `);
      } catch {
        console.log(`⚠️ لم يتم إرسال رسالة الترحيب للمستخدم ${userId}`);
      }

    } catch (error) {
      console.error(`❌ خطأ في معالجة العضو ${userId}:`, error);
    }
  }
}

// دالة طرد الأشخاص غير المصرح لهم
async function kickUnauthorized(chatId, userId) {
  try {
    await bot.kickChatMember(chatId, userId, 'غير مصرح');
    console.log(`🔨 تم طرد العضو ${userId} من القناة ${chatId}`);

    try {
      await bot.sendMessage(userId, `
❌ **دخول غير مصرح**
تم إخراجك من القناة.
💡 للحصول على دعوة صحيحة، تواصل مع المشرف.
      `);
    } catch {
      console.log(`⚠️ لم يتم إرسال إشعار الطرد للمستخدم ${userId}`);
    }
  } catch (err) {
    console.log(`⚠️ فشل في طرد المستخدم ${userId}:`, err.message);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook يعمل مع حماية حسب Telegram ID',
    timestamp: new Date().toISOString()
  });
}
