import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, parolă și nume sunt obligatorii." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă minim 6 caractere." },
        { status: 400 }
      );
    }

    await createUser(email, password, name);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Eroare la înregistrare.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
