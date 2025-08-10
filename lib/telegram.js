// ===== ملف lib/telegram.js المُحسَّن =====

import TelegramBot from 'node-telegram-bot-api';

class TelegramBotManager {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: false });
  }

  // إنشاء رابط دعوة محمي لشخص واحد محدد
  async createPersonalizedInviteLink(channelId, userId, expiryMinutes = 5) {
    try {
      const inviteLink = await this.bot.createChatInviteLink(channelId, {
        member_limit: 1, // شخص واحد فقط
        expire_date: Math.floor(Date.now() / 1000) + (expiryMinutes * 60)
      });

      console.log(`🔐 تم إنشاء رابط محمي للمستخدم ${userId}: ${inviteLink.invite_link}`);

      return {
        success: true,
        invite_link: inviteLink.invite_link,
        expire_date: inviteLink.expire_date
      };
    } catch (error) {
      console.error('خطأ في إنشاء الرابط:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال دعوة محمية مع تحذيرات أمنية واضحة
  async sendSecureInviteWithWarnings(userId, channelName, inviteLink, expiryMinutes) {
    try {
      const message = `
🔐 **دعوة محمية شخصياً لقناة ${channelName}**

📎 **رابط الدعوة الخاص بك:**
${inviteLink}

🚨 **تحذيرات أمنية مهمة جداً:**

🔴 **هذا الرابط مخصص لك أنت فقط (${userId})**
🔴 **يجب أن تدخل أنت شخصياً بحسابك الشخصي**
🔴 **إذا دخل أي شخص آخر بدلاً منك:**
   • سيتم طرده فوراً من القناة
   • سيتم إلغاء رابطك نهائياً
   • ستفقد حقك في العضوية
   • سيتم إبلاغ المشرفين بمحاولة الاختراق

⏰ **مدة الصلاحية:** ${expiryMinutes} دقائق فقط

⛔ **ممنوع تماماً:**
• مشاركة هذا الرابط مع أي شخص
• إرساله في مجموعات أو قنوات أخرى
• لصقه في أي مكان عام

✅ **للدخول الآمن:**
1. اضغط على الرابط بحسابك الشخصي فقط
2. انضم للقناة مباشرة
3. ستصلك رسالة تأكيد فور النجاح

🛡️ **هذا نظام حماية متقدم لضمان أمان القناة**
      `;

      await this.bot.sendMessage(userId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: false 
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // الدالة القديمة للتوافق مع الكود الموجود
  async sendSecureInvite(userId, channelName, inviteLink, verificationCode, expiryMinutes) {
    return this.sendSecureInviteWithWarnings(userId, channelName, inviteLink, expiryMinutes);
  }

  // إلغاء رابط الدعوة
  async revokeInviteLink(channelId, inviteLink) {
    try {
      await this.bot.revokeChatInviteLink(channelId, inviteLink);
      console.log(`🔒 تم إلغاء الرابط: ${inviteLink}`);
      return { success: true };
    } catch (error) {
      console.error(`خطأ في إلغاء الرابط: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // طرد عضو من القناة
  async kickChatMember(channelId, userId, reason = '') {
    try {
      console.log(`🔨 طرد المستخدم ${userId} من القناة ${channelId}. السبب: ${reason}`);
      
      await this.bot.banChatMember(channelId, userId);
      // إلغاء الحظر للسماح بدعوات مستقبلية إذا لزم
      await this.bot.unbanChatMember(channelId, userId);
      
      return { success: true };
    } catch (error) {
      console.error(`خطأ في طرد المستخدم ${userId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // إرسال رسالة عادية
  async sendMessage(chatId, text, options = {}) {
    try {
      await this.bot.sendMessage(chatId, text, { 
        parse_mode: 'Markdown',
        ...options 
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // التحقق من معلومات المستخدم
  async verifyUserIdentity(userId) {
    try {
      const chatMember = await this.bot.getChat(userId);
      return {
        isValid: true,
        userData: {
          id: chatMember.id,
          username: chatMember.username,
          first_name: chatMember.first_name,
          last_name: chatMember.last_name
        }
      };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  // دالة للتوافق مع الكود الموجود
  async createOneTimeInviteLink(channelId, userId, expiryMinutes = 5) {
    return this.createPersonalizedInviteLink(channelId, userId, expiryMinutes);
  }

  // دالة إضافية لإرسال تقرير أمني للمشرفين
  async sendSecurityAlert(adminId, details) {
    try {
      const message = `
🚨 **تنبيه أمني**

تم رصد محاولة اختراق:
${details}

⏰ الوقت: ${new Date().toLocaleString('ar-EG')}
🔧 تم اتخاذ الإجراءات التلقائية المناسبة
      `;

      await this.sendMessage(adminId, message);
    } catch (error) {
      console.log('لم يتم إرسال التنبيه الأمني');
    }
  }
}

// تصدير مثيل واحد
const botToken = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBotManager(botToken);
export default bot;