import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const directory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cucumberCli = resolve(
  directory,
  "node_modules",
  "@cucumber",
  "cucumber",
  "bin",
  "cucumber-js",
);
const headed = process.argv.includes("--headed");
const server = await createServer({
  root: directory,
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    watch: {
      ignored: ["**/dist/e2e/**"],
    },
  },
});

try {
  await server.listen();

  const cucumber = spawn(
    process.execPath,
    [cucumberCli, ...(headed ? ["--format", "progress"] : [])],
    {
      cwd: directory,
      stdio: "inherit",
      env: {
        ...process.env,
        ...(headed ? { PWDEBUG: "1" } : {}),
      },
    },
  );

  const exitCode = await new Promise((resolveExitCode) => {
    cucumber.on("exit", (code) => resolveExitCode(code ?? 1));
  });

  process.exitCode = exitCode;
} finally {
  await server.close();
}
