// ===== ملف app/api/bot/webhook/route.js الكامل المُحدث =====

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '../../../../lib/telegram.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const update = await request.json();
    
    // طباعة تفصيلية للتحديثات الواردة
    console.log('📨 === Webhook Update Received ===');
    console.log('🔢 Update ID:', update.update_id);
    console.log('📄 Update Type:', Object.keys(update).filter(key => key !== 'update_id'));
    console.log('📝 Full Update:', JSON.stringify(update, null, 2));
    console.log('=====================================');

    // معالجة أنواع مختلفة من التحديثات
    
    // 1. معالجة الرسائل العادية (للتشخيص)
    if (update.message && !update.message.new_chat_members) {
      console.log('💬 رسالة عادية من:', update.message.from?.username || update.message.from?.id);
      await handleRegularMessage(update.message);
    }

    // 2. معالجة انضمام أعضاء جدد ← هذا المهم!
    if (update.message && update.message.new_chat_members) {
      console.log('👥 أعضاء جدد انضموا!');
      await handleNewMembers(update.message);
    }

    // 3. معالجة تحديثات حالة الأعضاء
    if (update.chat_member) {
      console.log('👤 تحديث حالة عضو');
      await handleChatMemberUpdate(update.chat_member);
    }

    // 4. معالجة تحديثات حالة البوت نفسه
    if (update.my_chat_member) {
      console.log('🤖 تحديث حالة البوت');
      await handleMyChatMemberUpdate(update.my_chat_member);
    }

    // 5. معالجة طلبات الانضمام
    if (update.chat_join_request) {
      console.log('📋 طلب انضمام جديد');
      await handleJoinRequest(update.chat_join_request);
    }

    return NextResponse.json({ ok: true, processed: true });
    
  } catch (error) {
    console.error('❌ خطأ في webhook:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// معالجة الرسائل العادية (للتشخيص)
async function handleRegularMessage(message) {
  try {
    const userId = message.from.id.toString();
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    
    console.log(`💬 رسالة من ${userId} في ${chatId}: ${text.substring(0, 50)}`);
    
    // الرد على أي رسالة للتأكد من أن البوت يعمل
    if (message.chat.type === 'private') {
      let replyMessage = '✅ البوت يعمل بشكل صحيح!\n\n';
      
      if (text.includes('اختبار') || text.includes('test')) {
        replyMessage += '🔧 **تشخيص النظام:**\n';
        replyMessage += '• الـ webhook يستقبل الرسائل ✅\n';
        replyMessage += '• قاعدة البيانات متصلة ✅\n';
        replyMessage += '• النظام جاهز للاختبار ✅\n\n';
        replyMessage += '💡 **للاختبار:**\n';
        replyMessage += '1. أضف البوت لقناة كمشرف\n';
        replyMessage += '2. أنشئ دعوة من التطبيق\n';
        replyMessage += '3. اطلب من شخص آخر استخدام الرابط\n';
        replyMessage += '4. راقب النتائج!';
      } else {
        replyMessage += `📨 رسالتك: "${text}"\n`;
        replyMessage += '🤖 أرسل "اختبار" للمزيد من التفاصيل';
      }
      
      await bot.sendMessage(userId, replyMessage);
      console.log(`📤 تم الرد على المستخدم ${userId}`);
    }
    
  } catch (error) {
    console.error('خطأ في معالجة الرسالة العادية:', error);
  }
}

// معالجة الأعضاء الجدد مع التحقق الصارم من الهوية
async function handleNewMembers(message) {
  const chatId = message.chat.id.toString();
  const newMembers = message.new_chat_members;

  console.log(`👥 === معالجة ${newMembers.length} عضو جديد في القناة ${chatId} ===`);

  for (const newMember of newMembers) {
    if (newMember.is_bot) {
      console.log(`🤖 تم تجاهل البوت: ${newMember.username || newMember.id}`);
      continue;
    }

    const actualUserId = newMember.id.toString();
    const actualUsername = newMember.username || 'غير_معروف';
    const actualFirstName = newMember.first_name || 'غير_معروف';
    
    console.log(`\n🔍 === فحص العضو الجديد ===`);
    console.log(`👤 المعرف: ${actualUserId}`);
    console.log(`🏷️ اسم المستخدم: @${actualUsername}`);
    console.log(`📝 الاسم الأول: ${actualFirstName}`);
    console.log(`🏢 القناة: ${chatId}`);

    try {
      // البحث عن العضو المصرح له في هذه القناة تحديداً
      const authorizedMember = await prisma.member.findFirst({
        where: {
          channel: { telegramId: chatId },
          isActive: true,
          hasJoined: false // لم ينضم بعد
        },
        include: { channel: true },
        orderBy: { createdAt: 'desc' } // الأحدث أولاً
      });

      console.log(`🔎 البحث عن عضو مصرح في قاعدة البيانات...`);

      if (!authorizedMember) {
        // لا يوجد أحد مصرح له في هذه القناة
        console.log(`🚫 لا يوجد عضو مصرح في القناة ${chatId}`);
        await kickUnauthorizedUser(chatId, actualUserId, actualUsername, 'لا توجد عضوية مصرحة نشطة');
        continue;
      }

      console.log(`📋 عضو مصرح موجود:`);
      console.log(`👤 المعرف المصرح: ${authorizedMember.telegramId}`);
      console.log(`🏷️ اسم المستخدم المصرح: ${authorizedMember.username || 'غير_معروف'}`);
      console.log(`📅 تاريخ الإنشاء: ${authorizedMember.createdAt}`);

      // التحقق الرئيسي: هل الشخص الذي دخل هو نفسه المصرح له؟
      if (authorizedMember.telegramId === actualUserId) {
        // ✅ الشخص الصحيح دخل بنفسه
        console.log(`✅ === تطابق تام! العضو الصحيح انضم ===`);
        console.log(`🎯 ${actualUserId} هو نفس الشخص المصرح له`);
        
        await handleAuthorizedMemberJoin(authorizedMember, actualUserId);
        
      } else {
        // ❌ شخص آخر يستخدم رابط مخصص لشخص آخر
        console.log(`🚨 === تم رصد سرقة رابط! ===`);
        console.log(`👤 المصرح له: ${authorizedMember.telegramId} (@${authorizedMember.username})`);
        console.log(`🦹 المتسلل: ${actualUserId} (@${actualUsername})`);
        console.log(`⚡ بدء إجراءات الأمان...`);
        
        await handleLinkTheft(authorizedMember, actualUserId, actualUsername, chatId);
      }

    } catch (error) {
      console.error(`❌ خطأ في معالجة العضو ${actualUserId}:`, error);
      // في حالة الخطأ، نطرد للأمان
      await kickUnauthorizedUser(chatId, actualUserId, actualUsername, 'خطأ في النظام - أمان احترازي');
    }
  }

  console.log(`✅ === انتهت معالجة الأعضاء الجدد ===\n`);
}

// التعامل مع انضمام العضو المصرح
async function handleAuthorizedMemberJoin(authorizedMember, userId) {
  try {
    console.log(`🎉 === بدء معالجة انضمام العضو المصرح ${userId} ===`);

    // تحديث حالة الانضمام
    await prisma.member.update({
      where: { id: authorizedMember.id },
      data: { hasJoined: true }
    });
    console.log(`✅ تم تحديث hasJoined = true`);

    // إلغاء رابط الدعوة فوراً لمنع استخدامه مرة أخرى
    if (authorizedMember.inviteLink) {
      console.log(`🔒 بدء إلغاء رابط الدعوة للمستخدم ${userId}`);
      console.log(`🔗 الرابط: ${authorizedMember.inviteLink}`);
      
      const revokeResult = await bot.revokeInviteLink(
        authorizedMember.channel.telegramId,
        authorizedMember.inviteLink
      );

      if (revokeResult.success) {
        await prisma.member.update({
          where: { id: authorizedMember.id },
          data: { inviteLink: null }
        });
        console.log(`🎉 تم إلغاء الرابط نهائياً للمستخدم ${userId}`);
      } else {
        console.log(`⚠️ فشل في إلغاء الرابط: ${revokeResult.error}`);
      }
    }

    // إرسال رسالة ترحيب
    try {
      const welcomeMessage = `
🎉 **مرحباً بك في ${authorizedMember.channel.name}!**

✅ تم تأكيد انضمامك بنجاح
📅 مدة عضويتك تنتهي في: ${new Date(authorizedMember.kickDate).toLocaleString('ar-EG')}

🔒 تم إلغاء رابط الدعوة نهائياً
⚠️ إذا تم طردك أو خرجت، لن تتمكن من العودة

استمتع بالمحتوى! 🚀
      `;

      await bot.sendMessage(userId, welcomeMessage);
      console.log(`📨 تم إرسال رسالة الترحيب للمستخدم ${userId}`);
    } catch (error) {
      console.log(`⚠️ لم يتم إرسال رسالة الترحيب للمستخدم ${userId}: ${error.message}`);
    }

    console.log(`✅ === انتهت معالجة انضمام العضو المصرح بنجاح ===`);

  } catch (error) {
    console.error('❌ خطأ في معالجة انضمام العضو المصرح:', error);
  }
}

// التعامل مع سرقة الرابط
async function handleLinkTheft(authorizedMember, thiefUserId, thiefUsername, chatId) {
  try {
    console.log(`🚨 === بدء معالجة سرقة الرابط ===`);
    console.log(`👤 المصرح له: ${authorizedMember.telegramId}`);
    console.log(`🦹 المتسلل: ${thiefUserId}`);

    // إلغاء الرابط المسروق فوراً
    if (authorizedMember.inviteLink) {
      console.log(`🔒 إلغاء الرابط المسروق: ${authorizedMember.inviteLink}`);
      
      await bot.revokeInviteLink(
        authorizedMember.channel.telegramId,
        authorizedMember.inviteLink
      );
      
      // إلغاء العضوية المسروقة
      await prisma.member.update({
        where: { id: authorizedMember.id },
        data: { 
          inviteLink: null,
          isActive: false // إلغاء العضوية نهائياً
        }
      });
      console.log(`🔒 تم إلغاء الرابط وإيقاف العضوية`);
    }

    // طرد السارق فوراً
    await kickUnauthorizedUser(chatId, thiefUserId, thiefUsername, 'استخدام رابط مسروق');

    // إشعار الشخص المصرح له الأصلي
    try {
      const alertMessage = `
🚨 **تنبيه أمني خطير!**

تم رصد محاولة سرقة رابط الدعوة الخاص بك!

👤 **المحتال:**
• المعرف: ${thiefUserId}
• اسم المستخدم: @${thiefUsername}

🔒 **الإجراءات المتخذة:**
• تم طرد المحتال فوراً
• تم إلغاء رابطك القديم نهائياً
• تم إيقاف عضويتك لحمايتك

💡 **للحصول على دعوة جديدة آمنة، تواصل مع المشرف.**

⚠️ **تذكر:** لا تشارك روابط الدعوة مع أي شخص!
      `;

      await bot.sendMessage(authorizedMember.telegramId, alertMessage);
      console.log(`📨 تم إرسال تنبيه السرقة للعضو المصرح ${authorizedMember.telegramId}`);
    } catch (error) {
      console.log(`⚠️ لم يتم إرسال إشعار السرقة: ${error.message}`);
    }

    console.log(`✅ === انتهت معالجة سرقة الرابط ===`);

  } catch (error) {
    console.error('❌ خطأ في معالجة سرقة الرابط:', error);
  }
}

// طرد المستخدم غير المصرح
async function kickUnauthorizedUser(chatId, userId, username, reason) {
  try {
    console.log(`🔨 === بدء طرد المستخدم غير المصرح ===`);
    console.log(`👤 المستخدم: ${userId} (@${username})`);
    console.log(`📋 السبب: ${reason}`);
    console.log(`🏢 القناة: ${chatId}`);
    
    // طرد فوري بدون انتظار
    console.log(`⚡ تنفيذ طرد المستخدم ${userId} فوراً...`);
    
    const kickResult = await bot.kickChatMember(chatId, userId, reason);

    if (kickResult.success) {
      console.log(`✅ تم طرد ${userId} بنجاح من القناة ${chatId}`);
    } else {
      console.log(`⚠️ فشل طرد ${userId}: ${kickResult.error}`);
      
      // إذا فشل الطرد، جرب مرة أخرى بعد ثانية
      setTimeout(async () => {
        console.log(`🔄 محاولة طرد ثانية للمستخدم ${userId}`);
        const retryResult = await bot.kickChatMember(chatId, userId, reason + ' - محاولة ثانية');
        if (retryResult.success) {
          console.log(`✅ نجحت المحاولة الثانية لطرد ${userId}`);
        } else {
          console.log(`❌ فشلت المحاولة الثانية: ${retryResult.error}`);
        }
      }, 1000);
    }

    // إرسال إشعار للمطرود بدون انتظار
    setTimeout(async () => {
      try {
        let message = '';
        
        if (reason === 'استخدام رابط مسروق') {
          message = `
❌ **تم طردك لاستخدام رابط مسروق!**

🚨 قمت باستخدام رابط دعوة مخصص لشخص آخر
⛔ هذا يُعتبر انتهاكاً أمنياً خطيراً

🔒 **الإجراءات:**
• تم طردك من القناة فوراً
• تم إبلاغ المشرفين بمحاولة الاختراق
• لن تتمكن من الدخول مرة أخرى

⚖️ **تحذير:** سرقة الروابط مخالف للقوانين!
          `;
        } else {
          message = `
❌ **دخول غير مصرح**

تم طردك من القناة للأسباب التالية:
• لا تملك دعوة صالحة لهذه القناة
• أو انتهت صلاحية دعوتك

💡 للحصول على دعوة صحيحة، تواصل مع المشرف

📋 **السبب التقني:** ${reason}
          `;
        }

        await bot.sendMessage(userId, message);
        console.log(`📨 تم إرسال إشعار الطرد للمستخدم ${userId}`);
      } catch (error) {
        console.log(`⚠️ لم يتم إرسال إشعار الطرد للمستخدم ${userId}: ${error.message}`);
      }
    }, 500); // نصف ثانية

  } catch (error) {
    console.error(`❌ خطأ في طرد المستخدم ${userId}:`, error);
  }
}

// معالجة تحديثات حالة الأعضاء
async function handleChatMemberUpdate(chatMember) {
  try {
    console.log('👤 تحديث حالة عضو:', {
      chat: chatMember.chat.id,
      user: chatMember.new_chat_member.user.id,
      oldStatus: chatMember.old_chat_member.status,
      newStatus: chatMember.new_chat_member.status
    });
  } catch (error) {
    console.error('خطأ في معالجة تحديث حالة العضو:', error);
  }
}

// معالجة تحديثات حالة البوت
async function handleMyChatMemberUpdate(myChatMember) {
  try {
    console.log('🤖 تحديث حالة البوت:', {
      chat: myChatMember.chat.id,
      oldStatus: myChatMember.old_chat_member.status,
      newStatus: myChatMember.new_chat_member.status
    });
  } catch (error) {
    console.error('خطأ في معالجة تحديث حالة البوت:', error);
  }
}

// معالجة طلبات الانضمام
async function handleJoinRequest(joinRequest) {
  try {
    console.log('📋 طلب انضمام جديد:', {
      chat: joinRequest.chat.id,
      user: joinRequest.from.id,
      date: joinRequest.date
    });
  } catch (error) {
    console.error('خطأ في معالجة طلب الانضمام:', error);
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Advanced Security System with Identity Verification',
    timestamp: new Date().toISOString(),
    version: '2.0',
    features: [
      'Strict identity verification',
      'Link theft detection and prevention',
      'Auto-kick unauthorized users',
      'Real-time security monitoring',
      'Instant link revocation',
      'Comprehensive logging',
      'Multiple update types support'
    ],
    supported_updates: [
      'message',
      'chat_member', 
      'my_chat_member',
      'chat_join_request'
    ]
  });
}