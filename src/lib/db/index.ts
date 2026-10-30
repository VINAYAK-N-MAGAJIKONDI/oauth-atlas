import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { Guide, ResearchRun } from "@/types/guide";
import { seedGuides, seedGuidesList } from "@/data/seed";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_GUIDES_FILE = path.join(DATA_DIR, "guides.json");
const LOCAL_RUNS_FILE = path.join(DATA_DIR, "research_runs.json");

// In-memory cache for fast lookups
const memoryGuides = new Map<string, Guide>();
const memoryRuns = new Map<string, ResearchRun>();

// Initialize memory with seeds
for (const guide of seedGuidesList) {
  memoryGuides.set(guide.slug, guide);
}

function ensureLocalDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if read-only filesystem
    }
  }
}

function loadLocalGuides(): Record<string, Guide> {
  try {
    if (fs.existsSync(LOCAL_GUIDES_FILE)) {
      const content = fs.readFileSync(LOCAL_GUIDES_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Failed to read local guides file:", err);
  }
  return {};
}

function saveLocalGuides(guides: Record<string, Guide>) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_GUIDES_FILE, JSON.stringify(guides, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist local guides:", err);
  }
}

function loadLocalRuns(): Record<string, ResearchRun> {
  try {
    if (fs.existsSync(LOCAL_RUNS_FILE)) {
      const content = fs.readFileSync(LOCAL_RUNS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Failed to read local runs file:", err);
  }
  return {};
}

function saveLocalRuns(runs: Record<string, ResearchRun>) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_RUNS_FILE, JSON.stringify(runs, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist local runs:", err);
  }
}

// PostgreSQL / Neon Client
let isPostgresInitialized = false;

function getPostgresClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  try {
    return neon(connectionString);
  } catch (err) {
    console.warn("Neon initialization failed:", err);
    return null;
  }
}

async function initPostgresTables() {
  if (isPostgresInitialized) return;
  const sql = getPostgresClient();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guides (
        slug TEXT PRIMARY KEY,
        provider_name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS research_runs (
        run_id TEXT PRIMARY KEY,
        app_input TEXT NOT NULL,
        status TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    isPostgresInitialized = true;
  } catch (err) {
    console.warn("Could not initialize PostgreSQL tables:", err);
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  const result = new Map<string, Guide>();

  // Always seed first
  for (const guide of seedGuidesList) {
    result.set(guide.slug, guide);
  }

  // Load from local storage
  const localGuides = loadLocalGuides();
  for (const [slug, guide] of Object.entries(localGuides)) {
    result.set(slug, guide);
  }

  // Load from Postgres if configured
  const sql = getPostgresClient();
  if (sql) {
    try {
      await initPostgresTables();
      const rows = await sql`SELECT slug, data FROM guides ORDER BY updated_at DESC`;
      for (const row of rows) {
        if (row.data) {
          result.set(row.slug as string, row.data as Guide);
        }
      }
    } catch (err) {
      console.warn("Failed fetching guides from Postgres:", err);
    }
  }

  // Merge memory cache
  for (const [slug, guide] of memoryGuides.entries()) {
    result.set(slug, guide);
  }

  return Array.from(result.values());
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Check seed guides
  if (seedGuides[normalizedSlug]) {
    return seedGuides[normalizedSlug];
  }

  // 2. Check memory cache
  if (memoryGuides.has(normalizedSlug)) {
    return memoryGuides.get(normalizedSlug)!;
  }

  // 3. Check Postgres
  const sql = getPostgresClient();
  if (sql) {
    try {
      await initPostgresTables();
      const rows = await sql`SELECT data FROM guides WHERE slug = ${normalizedSlug} LIMIT 1`;
      if (rows.length > 0 && rows[0].data) {
        const guide = rows[0].data as Guide;
        memoryGuides.set(normalizedSlug, guide);
        return guide;
      }
    } catch (err) {
      console.warn(`Postgres lookup error for slug ${normalizedSlug}:`, err);
    }
  }

  // 4. Check local file
  const localGuides = loadLocalGuides();
  if (localGuides[normalizedSlug]) {
    memoryGuides.set(normalizedSlug, localGuides[normalizedSlug]);
    return localGuides[normalizedSlug];
  }

  return null;
}

export async function saveGuide(guide: Guide): Promise<Guide> {
  const normalizedSlug = guide.slug.toLowerCase().trim();
  memoryGuides.set(normalizedSlug, guide);

  // Save to local file
  const localGuides = loadLocalGuides();
  localGuides[normalizedSlug] = guide;
  saveLocalGuides(localGuides);

  // Save to Postgres if configured
  const sql = getPostgresClient();
  if (sql) {
    try {
      await initPostgresTables();
      await sql`
        INSERT INTO guides (slug, provider_name, data, updated_at)
        VALUES (${normalizedSlug}, ${guide.provider_name}, ${JSON.stringify(guide)}, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET provider_name = EXCLUDED.provider_name,
            data = EXCLUDED.data,
            updated_at = NOW();
      `;
    } catch (err) {
      console.warn("Failed saving guide to Postgres:", err);
    }
  }

  return guide;
}

export async function getResearchRun(runId: string): Promise<ResearchRun | null> {
  if (memoryRuns.has(runId)) {
    return memoryRuns.get(runId)!;
  }

  // Check Postgres
  const sql = getPostgresClient();
  if (sql) {
    try {
      await initPostgresTables();
      const rows = await sql`SELECT data FROM research_runs WHERE run_id = ${runId} LIMIT 1`;
      if (rows.length > 0 && rows[0].data) {
        const run = rows[0].data as ResearchRun;
        memoryRuns.set(runId, run);
        return run;
      }
    } catch (err) {
      console.warn(`Postgres lookup error for run ${runId}:`, err);
    }
  }

  // Check local file
  const localRuns = loadLocalRuns();
  if (localRuns[runId]) {
    memoryRuns.set(runId, localRuns[runId]);
    return localRuns[runId];
  }

  return null;
}

export async function saveResearchRun(run: ResearchRun): Promise<void> {
  memoryRuns.set(run.run_id, run);

  // Local storage
  const localRuns = loadLocalRuns();
  localRuns[run.run_id] = run;
  saveLocalRuns(localRuns);

  // Postgres
  const sql = getPostgresClient();
  if (sql) {
    try {
      await initPostgresTables();
      await sql`
        INSERT INTO research_runs (run_id, app_input, status, data, updated_at)
        VALUES (${run.run_id}, ${run.app_input}, ${run.status}, ${JSON.stringify(run)}, NOW())
        ON CONFLICT (run_id) DO UPDATE
        SET status = EXCLUDED.status,
            data = EXCLUDED.data,
            updated_at = NOW();
      `;
    } catch (err) {
      console.warn("Failed saving research run to Postgres:", err);
    }
  }
}

export async function updateResearchRun(
  runId: string,
  updates: Partial<ResearchRun>
): Promise<ResearchRun | null> {
  const current = await getResearchRun(runId);
  if (!current) return null;

  const updated: ResearchRun = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await saveResearchRun(updated);
  return updated;
}
