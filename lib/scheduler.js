// ===== 5. عدل ملف lib/scheduler.js =====

import { PrismaClient } from '@prisma/client';
import bot from './telegram.js';

const prisma = new PrismaClient();

class AutoKickScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.processedMembers = new Set(); // تتبع الأعضاء المُعالجين لتجنب التكرار
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ المجدول يعمل بالفعل');
      return;
    }

    console.log('🚀 بدء مجدول الطرد التلقائي...');
    this.isRunning = true;
    
    this.checkAndKickMembers();
    
    // فحص كل دقيقة بدلاً من 30 ثانية
    this.intervalId = setInterval(() => {
      this.checkAndKickMembers();
    }, 60000); // دقيقة واحدة
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      this.processedMembers.clear();
      console.log('⏹️ تم إيقاف مجدول الطرد التلقائي');
    }
  }

  async checkAndKickMembers() {
    try {
      const now = new Date();
      
      console.log(`🔍 فحص الأعضاء في: ${now.toLocaleString('ar-EG')}`);

      // 1. طرد الأعضاء الذين انتهت مدتهم (فقط المؤكدين والنشطين)
      const membersToKick = await prisma.member.findMany({
        where: {
          kickDate: { lte: now },
          isActive: true,
          hasJoined: true,
          tokenUsed: true // فقط الذين استخدموا التوكن
        },
        include: { channel: true }
      });

      if (membersToKick.length > 0) {
        console.log(`⚡ أعضاء للطرد: ${membersToKick.length}`);
      }

      for (const member of membersToKick) {
        const memberKey = `kick_${member.id}`;
        
        // تجنب معالجة نفس العضو أكثر من مرة
        if (this.processedMembers.has(memberKey)) {
          continue;
        }

        try {
          console.log(`🔄 طرد العضو ${member.telegramId} من ${member.channel.name}`);
          
          const kickResult = await bot.kickChatMember(
            member.channel.telegramId,
            member.telegramId
          );

          if (kickResult.success) {
            // تحديث الحالة في قاعدة البيانات
            await prisma.member.update({
              where: { id: member.id },
              data: { 
                isActive: false,
                uniqueToken: null // حذف التوكن نهائياً
              }
            });

            // إضافة العضو للقائمة المُعالجة
            this.processedMembers.add(memberKey);

            console.log(`✅ تم طرد ${member.telegramId} من ${member.channel.name}`);
            
            // إرسال إشعار واحد فقط
            try {
              await bot.sendMessage(
                member.telegramId,
                `📢 **انتهت مدة عضويتك**\n\nتم إخراجك من قناة "${member.channel.name}"\n\n🔒 رابطك الخاص لم يعد صالحاً\n\nشكراً لك! 👋`
              );
            } catch (notifyError) {
              console.log(`⚠️ لم يتم إرسال إشعار للمستخدم ${member.telegramId}`);
            }
          } else {
            console.log(`⚠️ فشل طرد ${member.telegramId}: ${kickResult.error}`);
          }
        } catch (error) {
          console.error(`❌ خطأ في طرد ${member.telegramId}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // انتظار ثانيتين بين كل عملية
      }

      // 2. تنظيف الأعضاء غير المؤكدين (بعد 5 دقائق)
      const unconfirmedMembers = await prisma.member.findMany({
        where: {
          hasJoined: false,
          tokenUsed: false,
          isActive: true, // فقط النشطين
          createdAt: {
            lte: new Date(now.getTime() - 5 * 60 * 1000) // 5 دقائق مضت
          }
        },
        include: { channel: true }
      });

      if (unconfirmedMembers.length > 0) {
        console.log(`🧹 أعضاء غير مؤكدين للحذف: ${unconfirmedMembers.length}`);
      }

      for (const member of unconfirmedMembers) {
        const memberKey = `cleanup_${member.id}`;
        
        // تجنب معالجة نفس العضو أكثر من مرة
        if (this.processedMembers.has(memberKey)) {
          continue;
        }

        try {
          console.log(`🗑️ حذف العضو غير المؤكد: ${member.telegramId}`);
          
          // محاولة طردهم من القناة إن كانوا منضمين
          try {
            await bot.kickChatMember(member.channel.telegramId, member.telegramId);
          } catch (kickError) {
            console.log(`⚠️ لم يتم طرد ${member.telegramId} (ربما غير موجود في القناة)`);
          }
          
          // تحديث الحالة بدلاً من الحذف
          await prisma.member.update({
            where: { id: member.id },
            data: { 
              isActive: false,
              uniqueToken: null,
              hasJoined: false
            }
          });

          // إضافة العضو للقائمة المُعالجة
          this.processedMembers.add(memberKey);

          // إرسال إشعار واحد فقط
          try {
            await bot.sendMessage(
              member.telegramId,
              `⏰ **انتهت صلاحية دعوتك**\n\nلم تقم بتأكيد عضويتك في قناة "${member.channel.name}" خلال 5 دقائق\n\n🔒 الرابط الخاص لم يعد صالحاً\n\n💡 للحصول على دعوة جديدة، تواصل مع المشرف`
            );
          } catch (notifyError) {
            console.log(`⚠️ لم يتم إرسال إشعار انتهاء الصلاحية للمستخدم ${member.telegramId}`);
          }
        } catch (error) {
          console.error(`❌ خطأ في حذف العضو غير المؤكد ${member.telegramId}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية واحدة
      }

      // تنظيف قائمة الأعضاء المُعالجين كل ساعة
      if (this.processedMembers.size > 1000) {
        console.log('🧹 تنظيف قائمة الأعضاء المُعالجين');
        this.processedMembers.clear();
      }

    } catch (error) {
      console.error('❌ خطأ في مجدول الطرد التلقائي:', error.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
      processedCount: this.processedMembers.size
    };
  }
}

const autoKickScheduler = new AutoKickScheduler();
export default autoKickScheduler;