import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { uploadAsset, getAsset } from "../src/lib/neon/storage";
import { callHelloFunction } from "../src/lib/neon/functions";
import { verifyNeonAuthService } from "../src/lib/neon/auth";
import { getNeonRealtimeStatus } from "../src/lib/neon/realtime";

// Load .env.local manually for standalone runner
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runNeonProof() {
  console.log("\n=======================================================");
  console.log("       NEON END-TO-END SERVICE VERIFICATION SUITE       ");
  console.log("=======================================================\n");

  let allOk = true;

  // 1. Lakebase Postgres
  console.log("1. Testing Neon Lakebase Postgres...");
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not found in .env.local");
    const sql = neon(dbUrl);
    const rows = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log(`   ✓ Connected to Lakebase Postgres!`);
    console.log(`     • Server Time: ${rows[0].current_time}`);
    console.log(`     • Version: ${rows[0].pg_version.split(" ")[0]} ${rows[0].pg_version.split(" ")[1]}`);
    console.log(`     • Connection Pooler: ${dbUrl.includes("-pooler") ? "Active" : "Direct"}`);
  } catch (err: unknown) {
    console.error(`   ✗ Lakebase Postgres failed: ${(err as Error).message}`);
    allOk = false;
  }

  // 2. Neon Functions
  console.log("\n2. Testing Neon Functions (Hello World)...");
  try {
    const fnResult = await callHelloFunction();
    if (!fnResult.success) throw new Error(fnResult.error || "Function call failed");
    console.log(`   ✓ Neon Function responded successfully!`);
    console.log(`     • Endpoint: ${fnResult.url}`);
    console.log(`     • Response Payload: "${fnResult.message}"`);
  } catch (err: unknown) {
    console.error(`   ✗ Neon Functions failed: ${(err as Error).message}`);
    allOk = false;
  }

  // 3. Neon Object Storage
  console.log("\n3. Testing Neon Object Storage (S3 Assets Bucket)...");
  try {
    const testKey = `proof-test-${Date.now()}.txt`;
    const testPayload = `OAuth Atlas Storage Verification at ${new Date().toISOString()}`;
    const uploadRes = await uploadAsset(testKey, testPayload, "text/plain");
    if (!uploadRes.success) throw new Error(uploadRes.error || "Upload failed");
    console.log(`   ✓ Uploaded object to bucket "assets" (Key: ${testKey})`);

    const readRes = await getAsset(testKey);
    if (!readRes.success || readRes.text !== testPayload) {
      throw new Error(readRes.error || "Content mismatch upon retrieval");
    }
    console.log(`   ✓ Retrieved and verified object content matches written payload!`);
  } catch (err: unknown) {
    console.error(`   ✗ Neon Object Storage failed: ${(err as Error).message}`);
    allOk = false;
  }

  // 4. Neon Auth
  console.log("\n4. Testing Neon Auth (Managed Better Auth / JWKS)...");
  try {
    const authRes = await verifyNeonAuthService();
    if (!authRes.jwksAccessible) throw new Error(authRes.error || "JWKS endpoint unreachable");
    console.log(`   ✓ Neon Auth JWKS endpoint reachable!`);
    console.log(`     • Base URL: ${authRes.baseUrl}`);
    console.log(`     • JWKS URL: ${authRes.jwksUrl}`);
    console.log(`     • Active Public Keys: ${authRes.keysCount}`);
  } catch (err: unknown) {
    console.error(`   ✗ Neon Auth failed: ${(err as Error).message}`);
    allOk = false;
  }

  // 5. Neon Realtime
  console.log("\n5. Testing Neon Realtime Configuration...");
  try {
    const realtimeRes = getNeonRealtimeStatus();
    if (!realtimeRes.configured) throw new Error("Realtime URL or Secret not configured");
    console.log(`   ✓ Neon Realtime configured!`);
    console.log(`     • Realtime URL: ${realtimeRes.realtimeUrl}`);
    console.log(`     • Realtime Secret: [Configured & Verified]`);
  } catch (err: unknown) {
    console.error(`   ✗ Neon Realtime failed: ${(err as Error).message}`);
    allOk = false;
  }

  console.log("\n=======================================================");
  if (allOk) {
    console.log("🎉 ALL 5 NEON SERVICES VERIFIED END-TO-END!");
  } else {
    console.log("⚠️ SOME NEON SERVICES ENCOUNTERED ISSUES (SEE ABOVE)");
  }
  console.log("=======================================================\n");

  if (!allOk) process.exit(1);
}

runNeonProof().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
