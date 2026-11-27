// Edita video/gravacao-mosaico.mp4: remove silêncios longos (pausas entre blocos),
// mantém respiro curto, normaliza o áudio e aplica fade de entrada/saída.
// Saída: video/out/gravacao-editada.mp4 (mesma resolução vertical 1080x1920).
// Uso: node video/editar-gravacao.mjs
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const ENTRADA = resolve(AQUI, "gravacao-mosaico.mp4");
const SAIDA = resolve(AQUI, "out/gravacao-editada.mp4");

// Silêncios medidos com silencedetect (-35dB, >=1s) em 27/11/2026.
// Cada segmento de fala é o complemento, com 0,35s de respiro nas bordas.
const FALA = [
  [1.67, 16.74],
  [25.26, 58.67],
  [86.92, 117.88],
  [127.11, 150.46],
  [157.98, 171.01],
  [172.02, 175.24],
  [189.52, 192.96],
  [196.42, 204.69],
];
const RESPIRO = 0.35;

const duracaoTotal = FALA.reduce((s, [a, b]) => s + (b - a), 0) + FALA.length * RESPIRO * 2;
const fadeSaida = Math.max(0, duracaoTotal - 0.5);
console.log(`segmentos: ${FALA.length} · duração estimada: ${duracaoTotal.toFixed(1)}s`);

const filtros = [];
const mapas = [];
FALA.forEach(([inicio, fim], i) => {
  const a = Math.max(0, inicio - RESPIRO);
  const b = fim + RESPIRO;
  filtros.push(`[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS[v${i}]`);
  filtros.push(`[0:a]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS[a${i}]`);
  mapas.push(`[v${i}][a${i}]`);
});
filtros.push(
  `${mapas.join("")}concat=n=${FALA.length}:v=1:a=1[vcat][acat]`,
  `[vcat]scale=720:1280[vout]`,
  `[acat]loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.4,afade=t=out:st=${fadeSaida.toFixed(2)}:d=0.5,aresample=48000[aout]`,
);

execFileSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-i", ENTRADA,
    "-filter_complex", filtros.join(";"),
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
    "-movflags", "+faststart",
    SAIDA,
  ],
  { stdio: "inherit" },
);
console.log(`saída: ${SAIDA}`);
