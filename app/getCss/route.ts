"use server";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const css = fs.readFileSync(
    path.join(process.cwd(), "styles/globals.css"),
    "utf8"
  );
  return NextResponse.json({ css });
}
