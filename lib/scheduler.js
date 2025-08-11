// ===== 5. تحديث lib/scheduler.js =====
// إزالة أي إشارات لـ tokenUsed و uniqueToken
import { PrismaClient } from '@prisma/client';
import bot from './telegram.js';

const prisma = new PrismaClient();

class AutoKickScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.processedMembers = new Set();
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ المجدول يعمل بالفعل');
      return;
    }

    console.log('🚀 بدء مجدول الطرد التلقائي...');
    this.isRunning = true;
    
    this.checkAndKickMembers();
    this.intervalId = setInterval(() => {
      this.checkAndKickMembers();
    }, 60000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      this.processedMembers.clear();
      console.log('⏹️ تم إيقاف المجدول');
    }
  }

  async checkAndKickMembers() {
    try {
      const now = new Date();
      
      console.log(`🔍 فحص الأعضاء: ${now.toLocaleString('ar-EG')}`);

      // طرد الأعضاء الذين انتهت مدتهم
      const membersToKick = await prisma.member.findMany({
        where: {
          kickDate: { lte: now },
          isActive: true,
          hasJoined: true
        },
        include: { channel: true }
      });

      for (const member of membersToKick) {
        const memberKey = `kick_${member.id}`;
        
        if (this.processedMembers.has(memberKey)) continue;

        try {
          const kickResult = await bot.kickChatMember(
            member.channel.telegramId,
            member.telegramId
          );

          if (kickResult.success) {
            await prisma.member.update({
              where: { id: member.id },
              data: { 
                isActive: false,
                inviteLink: null
              }
            });

            this.processedMembers.add(memberKey);

            await bot.sendMessage(
              member.telegramId,
              `📢 انتهت مدة عضويتك في "${member.channel.name}"`
            );
          }
        } catch (error) {
          console.error(`❌ خطأ في طرد ${member.telegramId}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // تنظيف الأعضاء غير المؤكدين
      const unconfirmedMembers = await prisma.member.findMany({
        where: {
          hasJoined: false,
          isActive: true,
          createdAt: {
            lte: new Date(now.getTime() - 5 * 60 * 1000)
          }
        }
      });

      for (const member of unconfirmedMembers) {
        await prisma.member.update({
          where: { id: member.id },
          data: { 
            isActive: false,
            inviteLink: null
          }
        });

        if (member.inviteLink) {
          await bot.revokeInviteLink(member.channel.telegramId, member.inviteLink);
        }
      }

    } catch (error) {
      console.error('❌ خطأ في المجدول:', error.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      processedCount: this.processedMembers.size
    };
  }
}

const autoKickScheduler = new AutoKickScheduler();
export default autoKickScheduler;