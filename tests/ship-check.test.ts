import { test, expect } from "claude-code/testing";
import { isLiveDeploy } from "../hooks/ship-guard.mjs";

test("recognises go-live commands", {}, async () => {
  for (const c of ["vercel --prod", "vercel deploy --prod", "npx vercel promote abc", "git push origin main", "git push -u origin master"])
    expect(isLiveDeploy(c)).toBe(true);
  for (const c of ["vercel", "vercel deploy", "git push origin feature/nav", "npm run build", "git status"])
    expect(isLiveDeploy(c)).toBe(false);
});

test("blocks going live before Ship Check", {}, async ($) => {
  const r = await $.tool.call({ tool: "Bash", command: "git push origin main" });
  expect(r.deny).toContain("Ship Guard");
});

test("leaves everyday commands alone", {}, async ($, on) => {
  on("tool.call", () => ({ result: "ran" }));
  const r = await $.tool.call({ tool: "Bash", command: "echo hello" });
  expect(r?.deny).toBeUndefined();
});

test("unlocks after Ship Check passes", {}, async ($, on) => {
  on("tool.call", () => ({ result: "ran" }));
  await $.tool.call({ tool: "Write", file_path: "/tmp/project/.ship-check-passed", content: "passed" });
  const r = await $.tool.call({ tool: "Bash", command: "echo vercel --prod" });
  expect(r?.deny).toBeUndefined();
});
