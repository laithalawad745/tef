import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, botToken } = await request.json();

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        botToken
      }
    });

    return NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      userId: user.id
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الحساب' },
      { status: 500 }
    );
  }
}