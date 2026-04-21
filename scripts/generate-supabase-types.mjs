import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectId = process.env.SUPABASE_PROJECT_ID;
if (!projectId) {
  console.error("Missing SUPABASE_PROJECT_ID env var.");
  process.exit(1);
}

const outputPath = resolve("src/lib/database.types.ts");
mkdirSync(dirname(outputPath), { recursive: true });

const cmd = `npx supabase gen types typescript --project-id ${projectId} --schema public`;

try {
  const out = execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  writeFileSync(outputPath, out, "utf8");
  console.log(`Supabase types written: ${outputPath}`);
} catch (err) {
  const msg = err?.stderr?.toString?.() || err?.message || "Unknown error";
  console.error("Failed to generate Supabase types.");
  console.error(msg);
  process.exit(1);
}

