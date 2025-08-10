// channels/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

export async function GET() {
  try {
    // مؤقتاً: إرجاع جميع القنوات بدون تحقق من المستخدم
    const channels = await prisma.channel.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error('خطأ في جلب القنوات:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { telegramId, name } = await request.json();

    // إنشاء مستخدم مؤقت إذا لم يكن موجود
    let tempUser = await prisma.user.findFirst({
      where: { email: 'temp@example.com' }
    });

    if (!tempUser) {
      tempUser = await prisma.user.create({
        data: {
          email: 'temp@example.com',
          password: 'temp-password'
        }
      });
    }

    const channel = await prisma.channel.create({
      data: {
        telegramId,
        name,
        userId: tempUser.id
      }
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error('خطأ في إضافة القناة:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}