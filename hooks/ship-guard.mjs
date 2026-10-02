// Ship Guard: blocks going live until Ship Check has passed.
// Ship Check unlocks it by writing a `.ship-check-passed` file in the project;
// the unlock lasts UNLOCK_MS.

const UNLOCK_MS = 2 * 60 * 60 * 1000;
const PASSED = { plugin: "ship-check", key: "passedAt" };

const LIVE_COMMANDS = [
  /\bvercel\b[^|;&]*--prod\b/,
  /\bvercel\b[^|;&]*\bpromote\b/,
  /\bgit\s+push\b[^|;&]*\b(main|master)\b/,
];

export const isLiveDeploy = (command) =>
  typeof command === "string" && LIVE_COMMANDS.some((re) => re.test(command));

export function register(on) {
  // Ship Check passing → record the time.
  on("tool.call", { tool: "Write" }, async ($, e, next) => {
    const result = await next(e);
    const path = e.file_path;
    if (typeof path === "string" && path.endsWith(".ship-check-passed")) {
      await $.state.set(PASSED, Date.now());
      $.ui.toast("✅ Ship Check passed — going live is unlocked for 2 hours");
    }
    return result;
  });

  // Going live → only if Ship Check passed recently.
  on("tool.call", { tool: "Bash" }, async ($, e, next) => {
    if (!isLiveDeploy(e.command)) return next(e);
    const { value: passedAt = 0 } = await $.state.get(PASSED);
    if (Date.now() - passedAt < UNLOCK_MS) return next(e);
    $.ui.toast("🔒 Ship Guard blocked going live — run Ship Check first");
    return {
      deny:
        "Ship Guard: this would publish the project live, but Ship Check hasn't passed in the last 2 hours. " +
        "Run the ship-check skill first; when it passes it writes .ship-check-passed and this unlocks.",
    };
  });
}
