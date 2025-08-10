// ===== ملف setup-webhook.js =====
// احفظ هذا الملف في مجلد المشروع وشغله مرة واحدة

const TELEGRAM_BOT_TOKEN = '8394267827:AAFu-suFMEJ3XiTU-Bmm86MnD_qGSGgkxBY';
const WEBHOOK_URL = 'https://tef-gules.vercel.app/api/bot/webhook'; // ← هذا الصحيح
async function setupWebhook() {
  try {
    console.log('🔧 بدء ضبط الـ webhook...');
    
    // أولاً: حذف أي webhook موجود
    console.log('🗑️ حذف الـ webhook القديم...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    const deleteResult = await deleteResponse.json();
    console.log('🗑️ نتيجة الحذف:', deleteResult.ok ? 'نجح' : deleteResult.description);

    // انتظار ثانيتين
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ثانياً: ضبط webhook جديد
    const webhookData = {
      url: WEBHOOK_URL,
      allowed_updates: [
        "message",
        "edited_message", 
        "callback_query",
        "inline_query",
        "chosen_inline_result",
        "chat_member",        // ← مهم جداً لرصد انضمام الأعضاء
        "my_chat_member",     // ← مهم جداً لرصد حالة البوت
        "chat_join_request"   // ← مهم جداً لطلبات الانضمام
      ],
      drop_pending_updates: true, // حذف التحديثات المعلقة
      max_connections: 40
      // يمكنك إضافة secret_token إذا أردت
    };

    console.log('🔧 ضبط الـ webhook الجديد...');
    console.log('📡 التحديثات المطلوبة:', webhookData.allowed_updates);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ تم ضبط الـ webhook بنجاح!');
      console.log('📋 البيانات:', result);
      
      // انتظار ثانية ثم فحص الحالة
      await new Promise(resolve => setTimeout(resolve, 1000));
      await checkWebhookInfo();
    } else {
      console.error('❌ فشل في ضبط الـ webhook:', result);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

async function checkWebhookInfo() {
  try {
    console.log('\n🔍 فحص حالة الـ webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    
    if (result.ok) {
      const info = result.result;
      console.log('📊 === معلومات الـ webhook ===');
      console.log('🔗 الرابط:', info.url || 'غير محدد');
      console.log('📡 التحديثات المسموحة:', info.allowed_updates || 'جميع التحديثات');
      console.log('⏳ التحديثات المعلقة:', info.pending_update_count || 0);
      console.log('🔗 الاتصالات القصوى:', info.max_connections || 'افتراضي');
      console.log('📅 آخر خطأ:', info.last_error_message || 'لا يوجد');
      console.log('📅 تاريخ آخر خطأ:', info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString('ar-EG') : 'لا يوجد');
      
      // تحقق من أن التحديثات المطلوبة موجودة
      const requiredUpdates = ['message', 'chat_member', 'my_chat_member'];
      const hasAllUpdates = requiredUpdates.every(update => 
        !info.allowed_updates || info.allowed_updates.includes(update)
      );
      
      if (hasAllUpdates || !info.allowed_updates) {
        console.log('✅ جميع التحديثات المطلوبة متوفرة');
      } else {
        console.log('⚠️ بعض التحديثات المطلوبة مفقودة:', requiredUpdates.filter(update => 
          !info.allowed_updates.includes(update)
        ));
      }
      
    } else {
      console.error('❌ فشل في جلب معلومات الـ webhook:', result);
    }
  } catch (error) {
    console.error('❌ خطأ في فحص الـ webhook:', error);
  }
}

async function testWebhook() {
  try {
    console.log('\n🧪 اختبار الـ webhook...');
    
    // إرسال رسالة اختبار للبوت نفسه
    const botInfo = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botResult = await botInfo.json();
    
    if (botResult.ok) {
      console.log(`🤖 اسم البوت: @${botResult.result.username}`);
      console.log('💡 لاختبار الـ webhook، أرسل رسالة للبوت أو أضفه لقناة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل السكريبت
console.log('🚀 بدء عملية ضبط الـ webhook...');
console.log('📝 تأكد من تحديث TELEGRAM_BOT_TOKEN و WEBHOOK_URL');
console.log('========================\n');

setupWebhook().then(() => {
  testWebhook();
});