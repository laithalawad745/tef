// ===== 1. تحديث lib/telegram.js =====
import TelegramBot from 'node-telegram-bot-api';

class TelegramBotManager {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: false });
  }

  // إنشاء رابط دعوة مع طلب الموافقة
  async createSecureInviteLink(channelId, userId, expiryMinutes = 5) {
    try {
      // إنشاء رابط يتطلب موافقة المشرف
      const inviteLink = await this.bot.createChatInviteLink(channelId, {
        creates_join_request: true, // مهم جداً - يتطلب موافقة
        expire_date: Math.floor(Date.now() / 1000) + (expiryMinutes * 60),
        name: `User_${userId}` // تسمية الرابط بمعرف المستخدم
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

  // إرسال الدعوة المحمية
  async sendSecureInvite(userId, channelName, inviteLink, expiryMinutes) {
    try {
      const message = `
🔐 **دعوة محمية لقناة ${channelName}**

📎 رابط الدعوة: ${inviteLink}

⚠️ **تعليمات مهمة:**
• هذا الرابط مخصص لك فقط
• عند الضغط على الرابط، سيتم إرسال طلب انضمام
• سيتم الموافقة تلقائياً إذا كان الطلب من حسابك فقط
• الرابط صالح لمدة ${expiryMinutes} دقائق

⛔ **تحذير:** إذا استخدم شخص آخر الرابط، سيتم رفض طلبه تلقائياً
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

  // قبول طلب الانضمام
  async approveChatJoinRequest(channelId, userId) {
    try {
      await this.bot.approveChatJoinRequest(channelId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // رفض طلب الانضمام
  async declineChatJoinRequest(channelId, userId) {
    try {
      await this.bot.declineChatJoinRequest(channelId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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
  async kickChatMember(channelId, userId) {
    try {
      await this.bot.banChatMember(channelId, userId);
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
}

const botToken = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBotManager(botToken);
export default bot;