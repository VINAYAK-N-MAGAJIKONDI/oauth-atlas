import { NextResponse } from "next/server";
import { getAllGuides } from "@/lib/db";

export async function GET() {
  try {
    const guides = await getAllGuides();
    return NextResponse.json(guides);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch guides" },
      { status: 500 }
    );
  }
}
