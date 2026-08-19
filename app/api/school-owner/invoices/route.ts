import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  const semester = searchParams.get('semester');

  const invoices = await prisma.invoice.findMany({
    where: { 
      schoolId: session.user.schoolId, 
      ...(classId ? { classId } : {}), 
      ...(semester ? { semester } : {}) 
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { username: true, email: true } },
      class: { select: { name: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { studentId, classId, semester, amount, dueDate } = await req.json();

    // Validate required fields
    if (!studentId || !classId || !semester || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get student with parents to find parent ID
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: {
          include: {
            parent: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get first parent (or you might want to handle multiple parents differently)
    const parentLink = student.parents[0];
    if (!parentLink) {
      return NextResponse.json({ error: 'Student has no parent linked' }, { status: 400 });
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        parentId: parentLink.parentId,
        classId,
        schoolId: session.user.schoolId,
        amount: parseFloat(amount),
        semester,
        dueDate: dueDate ? new Date(dueDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        status: 'PENDING'
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        parent: { select: { username: true, email: true } },
        class: { select: { name: true } },
        payments: true
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}