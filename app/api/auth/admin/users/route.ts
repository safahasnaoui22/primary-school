import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type TransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const actingRole = session.user.role;

  const body = await req.json();

  const {
    username,
    email,
    password,
    role,
    schoolId,
    schoolName,
  } = body;

  if (!username || !email || !password || !role) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  // -----------------------------
  // Permission rules
  // -----------------------------

  if (actingRole === "SUPER_ADMIN") {
    if (!["SCHOOL_OWNER", "TEACHER", "PARENT"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }
  } else if (actingRole === "SCHOOL_OWNER") {
    if (role !== "TEACHER") {
      return NextResponse.json(
        {
          error: "School owners can only create teacher accounts",
        },
        { status: 403 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }


  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error: "Email already in use",
      },
      {
        status: 409,
      }
    );
  }


  const hashed = await bcrypt.hash(password, 10);


  try {

    // ---------------------------------------------
    // CASE 1:
    // SUPER_ADMIN creates SCHOOL_OWNER + School
    // ---------------------------------------------

    if (
      actingRole === "SUPER_ADMIN" &&
      role === "SCHOOL_OWNER" &&
      schoolName
    ) {

      const result = await prisma.$transaction(
        async (tx: TransactionClient) => {

          const owner = await tx.user.create({
            data: {
              username,
              email,
              password: hashed,
              role: "SCHOOL_OWNER",
            },
          });


          const school = await tx.school.create({
            data: {
              name: schoolName,
              ownerId: owner.id,
            },
          });


          const updatedOwner = await tx.user.update({
            where: {
              id: owner.id,
            },
            data: {
              schoolId: school.id,
            },
          });


          return {
            owner: updatedOwner,
            school,
          };
        }
      );


      return NextResponse.json({
        owner: {
          id: result.owner.id,
          email: result.owner.email,
          username: result.owner.username,
          role: result.owner.role,
        },
        school: {
          id: result.school.id,
          name: result.school.name,
        },
      });
    }



    // ---------------------------------------------
    // CASE 2:
    // SCHOOL_OWNER creates TEACHER
    // ---------------------------------------------

    if (
      actingRole === "SCHOOL_OWNER" &&
      role === "TEACHER"
    ) {

      if (!session.user.schoolId) {
        return NextResponse.json(
          {
            error: "You are not linked to a school",
          },
          {
            status: 400,
          }
        );
      }


      const teacher = await prisma.user.create({
        data: {
          username,
          email,
          password: hashed,
          role: "TEACHER",
          schoolId: session.user.schoolId,
        },
      });


      return NextResponse.json({
        id: teacher.id,
        email: teacher.email,
        role: teacher.role,
      });
    }




    // ---------------------------------------------
    // CASE 3:
    // SUPER_ADMIN creates user directly
    // ---------------------------------------------

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role,
        schoolId: schoolId ?? null,
      },
    });


    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });



  } catch (err) {

    console.error("Create user error:", err);


    return NextResponse.json(
      {
        error: "Failed to create user",
      },
      {
        status: 500,
      }
    );
  }
}