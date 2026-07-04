import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email or username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Only accept valid roles
    const validRoles = ["ADMIN", "SCHOOL_OWNER", "TEACHER", "PARENT"];
    const finalRole = validRoles.includes(role) ? role : "PARENT";

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: finalRole,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, username: user.username, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}