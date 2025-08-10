// ===== تحديث app/api/members/route.js مع تشخيص مفصل =====

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '../../../lib/telegram.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { telegramId, channelId, kickDate, username, firstName, lastName, minutes } = await request.json();

    console.log(`📝 === بدء إنشاء عضوية ===`);
    console.log(`👤 المستخدم: ${telegramId}`);
    console.log(`🏢 القناة: ${channelId}`);
    console.log(`⏰ المدة: ${minutes} دقيقة`);

    // التحقق من وجود القناة
    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    });

    if (!channel) {
      console.error(`❌ القناة غير موجودة: ${channelId}`);
      return NextResponse.json({ error: 'القناة غير موجودة' }, { status: 404 });
    }

    console.log(`✅ تم العثور على القناة: ${channel.name} (${channel.telegramId})`);

    // التحقق من عدم وجود عضوية نشطة لنفس المستخدم
    const existingMember = await prisma.member.findFirst({
      where: {
        telegramId,
        channelId,
        isActive: true
      }
    });

    if (existingMember) {
      console.warn(`⚠️ المستخدم لديه عضوية نشطة بالفعل: ${telegramId}`);
      return NextResponse.json({
        error: 'المستخدم لديه عضوية نشطة بالفعل في هذه القناة'
      }, { status: 400 });
    }

    console.log(`🔗 بدء إنشاء رابط دعوة للمستخدم ${telegramId}`);

    // إنشاء رابط دعوة محمي للشخص المحدد فقط
    const inviteLinkResult = await bot.createPersonalizedInviteLink(
      channel.telegramId,
      telegramId,
      minutes + 2
    );

    if (!inviteLinkResult.success) {
      console.error(`❌ فشل في إنشاء رابط الدعوة: ${inviteLinkResult.error}`);
      return NextResponse.json({
        error: `فشل في إنشاء رابط الدعوة: ${inviteLinkResult.error}`
      }, { status: 500 });
    }

    console.log(`✅ تم إنشاء رابط الدعوة بنجاح`);
    console.log(`🔗 الرابط: ${inviteLinkResult.invite_link}`);

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
        hasJoined: false
      }
    });

    console.log(`💾 تم حفظ العضو في قاعدة البيانات: ${member.id}`);

    // إرسال الرسالة - اختبار طرق متعددة
    console.log(`📤 === بدء إرسال الرسالة للمستخدم ${telegramId} ===`);
    
    const messageText = `
🔐 **دعوة محمية شخصياً لقناة ${channel.name}**

📎 **رابط الدعوة الخاص بك:**
${inviteLinkResult.invite_link}

⏰ **مدة الصلاحية:** ${minutes} دقيقة فقط

🚨 **تحذير مهم:** هذا الرابط مخصص لك أنت فقط!
    `;

    // الطريقة الأولى: استخدام bot object
    console.log(`🔄 جرب الطريقة الأولى: bot.sendMessage`);
    try {
      const botResult = await bot.sendMessage(telegramId, messageText);
      if (botResult.success) {
        console.log(`✅ نجح الإرسال عبر bot.sendMessage`);
        return NextResponse.json({
          member,
          message: `تم إرسال الدعوة بنجاح عبر bot.sendMessage!`,
          method: 'bot.sendMessage'
        });
      } else {
        console.warn(`⚠️ فشل bot.sendMessage: ${botResult.error}`);
      }
    } catch (botError) {
      console.error(`❌ خطأ في bot.sendMessage:`, botError);
    }

    // الطريقة الثانية: استخدام fetch مباشر
    console.log(`🔄 جرب الطريقة الثانية: fetch مباشر`);
    try {
      const fetchResponse = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: telegramId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });

      const fetchResult = await fetchResponse.json();
      console.log(`📊 نتيجة fetch:`, fetchResult);
      
      if (fetchResult.ok) {
        console.log(`✅ نجح الإرسال عبر fetch مباشر`);
        console.log(`📨 Message ID: ${fetchResult.result.message_id}`);
        
        return NextResponse.json({
          member,
          message: `تم إرسال الدعوة بنجاح عبر fetch!`,
          messageId: fetchResult.result.message_id,
          method: 'fetch'
        });
      } else {
        console.error(`❌ فشل fetch: ${fetchResult.description}`);
      }
    } catch (fetchError) {
      console.error(`❌ خطأ في fetch:`, fetchError);
    }

    // الطريقة الثالثة: تحقق من البيئة
    console.log(`🔍 فحص متغيرات البيئة:`);
    console.log(`🔑 BOT_TOKEN موجود: ${!!process.env.BOT_TOKEN}`);
    console.log(`🔑 BOT_TOKEN يبدأ بـ: ${process.env.BOT_TOKEN?.substring(0, 10)}...`);
    
    // إذا فشل كل شيء، أرجع الرابط يدوياً
    console.log(`⚠️ فشل في جميع طرق الإرسال - إرجاع الرابط يدوياً`);
    
    return NextResponse.json({
      member,
      message: 'تم إنشاء الدعوة لكن فشل الإرسال التلقائي',
      invite_link: inviteLinkResult.invite_link,
      manual_send_required: true,
      debug_info: {
        bot_token_exists: !!process.env.BOT_TOKEN,
        bot_token_prefix: process.env.BOT_TOKEN?.substring(0, 10)
      }
    });

  } catch (error) {
    console.error('❌ خطأ عام في إضافة العضو:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
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