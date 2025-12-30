import { NextResponse } from "next/server";
import tailwindConfig from "../../../tailwind.config.js";

export async function GET() {
  try {
    return NextResponse.json({
      data: tailwindConfig,
    });
  } catch (err) {
    console.error("Error loading tailwind config:", err);
    return NextResponse.json({
      success: false,
      error: "Failed to load tailwind config",
    });
  }
}
