//test-bot 

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({ 
        error: 'BOT_TOKEN غير موجود في ملف .env' 
      }, { status: 400 });
    }

    // اختبار التوكن
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        bot_info: data.result,
        message: 'البوت يعمل بنجاح!'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.description,
        token_used: botToken.substring(0, 10) + '...' // عرض جزء من التوكن فقط
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}