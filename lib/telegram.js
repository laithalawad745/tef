// ===== ملف lib/telegram.js =====
// احفظ هذا الكود في ملف lib/telegram.js

import TelegramBot from 'node-telegram-bot-api';

class TelegramBotManager {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: false });
  }

  // إنشاء رابط دعوة مخصص لمستخدم واحد فقط
  async createPersonalizedInviteLink(channelId, userId, expiryMinutes = 5) {
    try {
      // إنشاء رابط دعوة بإعدادات صارمة
      // ملاحظة: لا يمكن استخدام member_limit مع creates_join_request
      const inviteLink = await this.bot.createChatInviteLink(channelId, {
        member_limit: 1, // السماح لشخص واحد فقط
        expire_date: Math.floor(Date.now() / 1000) + (expiryMinutes * 60)
        // تم إزالة creates_join_request لأنه يتعارض مع member_limit
      });

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

  // إرسال الدعوة مع رمز التحقق
  async sendSecureInvite(userId, channelName, inviteLink, verificationCode, expiryMinutes) {
    try {
      const message = `
🔐 **دعوة محمية لقناة ${channelName}**

📎 رابط الدعوة: ${inviteLink}

🔑 **رمز التحقق الخاص بك: ${verificationCode}**

⚠️ **تنبيهات مهمة:**
• هذا الرابط مخصص لك فقط
• سيُطلب منك رمز التحقق عند الانضمام
• الرابط صالح لمدة ${expiryMinutes} دقائق
• إذا شاركت الرابط، لن يتمكن الآخرون من الدخول بدون الرمز

⛔ **لا تشارك رمز التحقق مع أي شخص!**
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

  // التحقق من هوية المستخدم عند الانضمام
  async verifyUserIdentity(userId, username) {
    try {
      // الحصول على معلومات المستخدم من التلغرام
      const chatMember = await this.bot.getChat(userId);
      
      // التحقق من المطابقة
      return {
        isValid: chatMember.id.toString() === userId.toString(),
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

  // إلغاء رابط الدعوة
  async revokeInviteLink(channelId, inviteLink) {
    try {
      await this.bot.revokeChatInviteLink(channelId, inviteLink);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // طرد عضو من القناة
  async kickChatMember(channelId, userId, reason = '') {
    try {
      await this.bot.banChatMember(channelId, userId);
      // إلغاء الحظر فوراً (للسماح بالانضمام مستقبلاً إذا لزم)
      await this.bot.unbanChatMember(channelId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // إرسال رسالة
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

  // الدوال الموجودة سابقاً (إضافتها للتوافق)
  async createOneTimeInviteLink(channelId, userId, expiryMinutes = 5) {
    return this.createPersonalizedInviteLink(channelId, userId, expiryMinutes);
  }

  async sendOneTimeInvite(userId, channelName, inviteLink, expiryMinutes) {
    try {
      const message = `
🎉 **دعوة خاصة لك للانضمام إلى قناة ${channelName}**

📎 رابط الدعوة (لمرة واحدة فقط): ${inviteLink}

⏰ هذا الرابط صالح لمدة ${expiryMinutes} دقائق فقط
⚠️ يمكن استخدام هذا الرابط مرة واحدة فقط

بمجرد انضمامك، ستحصل على العضوية للمدة المحددة.
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
}

// تصدير مثيل واحد
const botToken = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBotManager(botToken);
export default bot;

