export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { uploadAsset, getAsset } from "@/lib/neon/storage";
import { callHelloFunction } from "@/lib/neon/functions";
import { verifyNeonAuthService } from "@/lib/neon/auth";
import { getNeonRealtimeStatus } from "@/lib/neon/realtime";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    branch: process.env.NEON_BRANCH || "production",
  };

  // 1. Test Lakebase Postgres
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    results.postgres = { success: false, error: "DATABASE_URL not set" };
  } else {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT NOW() as current_time, version() as pg_version`;
      results.postgres = {
        success: true,
        currentTime: rows[0]?.current_time,
        version: rows[0]?.pg_version,
        pooled: dbUrl.includes("-pooler"),
      };
    } catch (err: unknown) {
      results.postgres = { success: false, error: (err as Error).message };
    }
  }

  // 2. Test Neon Functions (Hello World)
  const fnResult = await callHelloFunction();
  results.functions = {
    name: "hello",
    ...fnResult,
  };

  // 3. Test Neon Object Storage (S3 compatible)
  const testKey = `test-health-${Date.now()}.txt`;
  const testContent = `OAuth Atlas Neon Storage Healthcheck at ${new Date().toISOString()}`;
  const uploadRes = await uploadAsset(testKey, testContent, "text/plain");

  if (uploadRes.success) {
    const readRes = await getAsset(testKey);
    results.objectStorage = {
      success: true,
      bucket: "assets",
      uploadedKey: testKey,
      contentVerified: readRes.text === testContent,
    };
  } else {
    results.objectStorage = {
      success: false,
      bucket: "assets",
      error: uploadRes.error,
    };
  }

  // 4. Test Neon Auth (JWKS)
  const authRes = await verifyNeonAuthService();
  results.auth = authRes;

  // 5. Test Neon Realtime
  const realtimeRes = getNeonRealtimeStatus();
  results.realtime = realtimeRes;

  const allPassed =
    (results.postgres as { success?: boolean })?.success &&
    (results.functions as { success?: boolean })?.success &&
    (results.objectStorage as { success?: boolean })?.success &&
    (results.auth as { jwksAccessible?: boolean })?.jwksAccessible &&
    (results.realtime as { configured?: boolean })?.configured;

  return NextResponse.json(
    {
      allPassed: Boolean(allPassed),
      services: results,
    },
    { status: allPassed ? 200 : 207 }
  );
}
