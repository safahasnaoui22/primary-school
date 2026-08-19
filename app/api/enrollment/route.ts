import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Vous devez être connecté en tant que parent' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { parentPhone, children, medical, consent } = body;

    if (!parentPhone || !parentPhone.trim()) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }
    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins un enfant' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Le consentement est requis' }, { status: 400 });
    }

    const schoolId = process.env.SCHOOL_ID;
    if (!schoolId) {
      return NextResponse.json({ error: "SCHOOL_ID n'est pas configuré" }, { status: 500 });
    }
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'École introuvable' }, { status: 500 });
    }

    // Create enrollment request
    const enrollment = await prisma.enrollmentRequest.create({
      data: {
        schoolId,
        parentId: session.user.id,
        parentPhone,
        childrenJson: children,
        medical: medical || null,
        consent,
      },
    });

    // Create students and link to parent
    const createdStudents = [];
    const createdInvoices = [];
    
    for (const child of children) {
      // Check if class exists and belongs to school
      const classRecord = await prisma.class.findFirst({
        where: {
          id: child.classId,
          schoolId: schoolId
        }
      });

      if (!classRecord) {
        console.warn(`Class ${child.classId} not found for school ${schoolId}`);
        continue;
      }

      // Create student (without age/gender since they're not in schema)
      const student = await prisma.student.create({
        data: {
          firstName: child.firstName,
          lastName: child.lastName,
          classId: child.classId,
          schoolId: schoolId,
        }
      });

      // Link parent to student through ParentStudent join table
      await prisma.parentStudent.create({
        data: {
          parentId: session.user.id,
          studentId: student.id,
        }
      });

      createdStudents.push(student);

      // Check for fee structures for this class
      const feeStructures = await prisma.feeStructure.findMany({
        where: { classId: child.classId }
      });

      // Create invoices for each fee structure
      for (const fee of feeStructures) {
        const invoice = await prisma.invoice.create({
          data: {
            studentId: student.id,
            parentId: session.user.id,
            classId: child.classId,
            schoolId: schoolId,
            amount: fee.amount,
            semester: fee.semester,
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            status: 'PENDING'
          }
        });
        createdInvoices.push(invoice);
      }
    }

    return NextResponse.json({ 
      id: enrollment.id,
      studentsCreated: createdStudents.length,
      invoicesCreated: createdInvoices.length
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}