import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { exportFullDatabase } from "@/lib/data";

export async function GET() {
  await verifySession();
  const payload = exportFullDatabase();

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="propuesta-de-valor.json"',
    },
  });
}
