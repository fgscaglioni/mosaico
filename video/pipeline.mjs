// Gera o vídeo de demo do Mosaico de ponta a ponta:
// build → servidor local → gravação das cenas → narração (edge-tts) → composição → render.
// Uso: node video/pipeline.mjs [--sem-build] [--sem-gravar] [--sem-tts] [--so-check]
import { spawn, spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, rmSync, readFileSync } from "node:fs";
import { createServer } from "node:net";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "..");
const OUT = resolve(AQUI, "out");
const PORTA = 8799;

const tem = (flag) => process.argv.includes(flag);

function rodar(comando, args, cwd = RAIZ) {
  console.log(`\n$ ${comando} ${args.join(" ")}`);
  const r = spawnSync(comando, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`falhou (${r.status}): ${comando} ${args.join(" ")}`);
}

async function esperarPorta(porta, tentativas = 60) {
  const livre = () =>
    new Promise((ok) => {
      const s = createServer();
      s.once("error", () => ok(false));
      s.once("listening", () => s.close(() => ok(true)));
      s.listen(porta, "127.0.0.1");
    });
  for (let i = 0; i < tentativas; i++) {
    if (!(await livre())) return; // porta em uso = servidor no ar
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`servidor não subiu na porta ${porta}`);
}

mkdirSync(OUT, { recursive: true });

if (!tem("--sem-build")) rodar("npm", ["run", "build"]);

// servidor com base de eventos limpa, para o painel da demo começar do zero
const DATA = resolve(OUT, "data");
rmSync(DATA, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });

const servidor = spawn("node", ["server.mjs"], {
  cwd: RAIZ,
  env: { ...process.env, PORT: String(PORTA), DATA_DIR: DATA },
  stdio: "ignore",
});

try {
  await esperarPorta(PORTA);
  const saude = await fetch(`http://127.0.0.1:${PORTA}/api/health`).then((r) => r.json());
  if (saude.status !== "ok") throw new Error(`health inesperado: ${JSON.stringify(saude)}`);

  if (!tem("--sem-gravar")) {
    rodar("node", ["video/record.mjs", "--base", `http://localhost:${PORTA}`]);
  }

  if (!tem("--sem-tts")) {
    const spec = JSON.parse(readFileSync(resolve(AQUI, "narracao.json"), "utf8"));
    mkdirSync(resolve(OUT, "audio"), { recursive: true });
    for (const c of spec.scenes) {
      rodar("python3", [
        "-m", "edge_tts",
        "--voice", spec.voice,
        `--rate=${spec.rate}`,
        "--text", c.narracao,
        "--write-media", resolve(OUT, "audio", `${c.id}.mp3`),
      ]);
    }
  }

  // Trilha sonora de fundo: pad sintetizado em ffmpeg (sem arquivo de terceiros),
  // já mixado baixo, cerca de 27 dB abaixo da narração. Gera sempre, mesmo com --sem-tts.
  mkdirSync(resolve(OUT, "audio"), { recursive: true });
  rodar("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", "sine=frequency=110:duration=180",
    "-f", "lavfi", "-i", "sine=frequency=164.81:duration=180",
    "-f", "lavfi", "-i", "sine=frequency=220:duration=180",
    "-f", "lavfi", "-i", "sine=frequency=261.63:duration=180",
    "-filter_complex",
    "[0:a]volume=0.5[t0];[1:a]volume=0.35[t1];[2:a]volume=0.25[t2];[3:a]volume=0.2[t3];" +
      "[t0][t1][t2][t3]amix=inputs=4:duration=longest:dropout_transition=0," +
      "lowpass=f=900,tremolo=f=0.25:d=0.4,volume=0.45,afade=t=in:st=0:d=4,afade=t=out:st=172:d=8",
    "-c:a", "libmp3lame", "-b:a", "96k",
    resolve(OUT, "audio", "trilha.mp3"),
  ]);

  rodar("node", ["video/compor.mjs"]);

  const ambiente = {
    ...process.env,
    HYPERFRAMES_NO_TELEMETRY: "1",
    HYPERFRAMES_NO_UPDATE_CHECK: "1",
    HYPERFRAMES_AGENT: "1",
  };
  for (const args of [["check", "video/out/projeto"], ["render", "video/out/projeto", "--output", "video/out/mosaico-demo.mp4", "--quality", "delivery"]]) {
    const r = spawnSync("npx", ["-y", "hyperframes@latest", ...args], { cwd: RAIZ, stdio: "inherit", env: ambiente });
    if (r.status !== 0) throw new Error(`hyperframes ${args[0]} falhou`);
  }

  const sonda = spawnSync(
    "ffprobe",
    [
      "-v", "error", "-show_entries", "format=duration,size:stream=codec_name,width,height",
      "-of", "default=noprint_wrappers=1", resolve(OUT, "mosaico-demo.mp4"),
    ],
    { encoding: "utf8" },
  ).stdout;
  console.log(`\n${sonda}`);
  console.log(`vídeo: ${resolve(OUT, "mosaico-demo.mp4")}`);
} finally {
  servidor.kill("SIGTERM");
}
