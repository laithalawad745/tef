//scheduler
import { NextResponse } from 'next/server';
import autoKickScheduler from '../../../lib/scheduler.js';

export async function GET() {
  try {
    const status = autoKickScheduler.getStatus();
    return NextResponse.json({
      scheduler_status: status,
      message: status.isRunning ? 'المجدول يعمل' : 'المجدول متوقف'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === 'start') {
      autoKickScheduler.start();
      return NextResponse.json({
        success: true,
        message: 'تم تشغيل مجدول الطرد التلقائي',
        status: autoKickScheduler.getStatus()
      });
    } else if (action === 'stop') {
      autoKickScheduler.stop();
      return NextResponse.json({
        success: true,
        message: 'تم إيقاف مجدول الطرد التلقائي',
        status: autoKickScheduler.getStatus()
      });
    } else {
      return NextResponse.json({
        error: 'إجراء غير صحيح. استخدم "start" أو "stop"'
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}