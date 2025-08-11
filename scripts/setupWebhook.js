// ===== ملف scripts/setupWebhook.js =====

// استيراد المكتبات
const https = require('https');

// ⚠️ ضع معلوماتك هنا
const BOT_TOKEN = '8394267827:AAFu-suFMEJ3XiTU-Bmm86MnD_qGSGgkxBY'; // نفس التوكن الموجود في .env
const YOUR_DOMAIN = 'ضع_دومين_موقعك_هنا'; // مثل: your-app.vercel.app أو localhost مع ngrok

// رابط الـ Webhook
const WEBHOOK_URL = `https://${YOUR_DOMAIN}/api/bot/webhook`;

async function setupWebhook() {
  console.log('🔧 بدء إعداد Webhook...');
  console.log('📍 الرابط:', WEBHOOK_URL);

  // الخطوة 1: حذف أي webhook قديم
  console.log('\n1️⃣ حذف Webhook القديم...');
  
  const deleteUrl = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;
  
  https.get(deleteUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('✅ تم حذف Webhook القديم:', JSON.parse(data));
      
      // الخطوة 2: إعداد webhook جديد
      console.log('\n2️⃣ إعداد Webhook الجديد...');
      
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/setWebhook`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const webhookData = JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: [
          'message',
          'chat_member',        // مهم جداً
          'my_chat_member',     // مهم
          'chat_join_request'   // للطلبات
        ],
        drop_pending_updates: true
      });

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log('✅ تم إعداد Webhook بنجاح!');
            console.log('📊 التفاصيل:', result);
            
            // الخطوة 3: التحقق من الإعداد
            console.log('\n3️⃣ التحقق من الإعداد...');
            checkWebhook();
          } else {
            console.log('❌ فشل الإعداد:', result);
          }
        });
      });

      req.on('error', (e) => {
        console.error('❌ خطأ:', e);
      });

      req.write(webhookData);
      req.end();
    });
  }).on('error', (e) => {
    console.error('❌ خطأ في حذف Webhook:', e);
  });
}

function checkWebhook() {
  const checkUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
  
  https.get(checkUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const info = JSON.parse(data);
      console.log('\n📋 معلومات Webhook الحالي:');
      console.log('• الرابط:', info.result.url);
      console.log('• آخر خطأ:', info.result.last_error_message || 'لا يوجد');
      console.log('• التحديثات المسموحة:', info.result.allowed_updates);
      console.log('• عدد التحديثات المعلقة:', info.result.pending_update_count);
      
      if (info.result.url === WEBHOOK_URL) {
        console.log('\n✅ ✅ ✅ تم الإعداد بنجاح! ✅ ✅ ✅');
      } else {
        console.log('\n❌ الرابط لا يتطابق!');
      }
    });
  }).on('error', (e) => {
    console.error('❌ خطأ في التحقق:', e);
  });
}

// تشغيل الإعداد
setupWebhook();