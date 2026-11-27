// Monta o projeto HyperFrames (video/out/projeto) a partir de video/narracao.json,
// das durações reais do áudio (edge-tts) e dos clipes gravados pelo Playwright.
// Estrutura: index.html (raiz) + compositions/cenaN.html (uma sub-composição por cena).
// Uso: node video/compor.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const AQUI = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(AQUI, "out");
const AUDIO = resolve(OUT, "audio");
const CLIPS = resolve(OUT, "clips");
const PROJETO = resolve(OUT, "projeto");
const MEDIA = resolve(PROJETO, "media");
const COMPS = resolve(PROJETO, "compositions");

const duracao = (arquivo) =>
  Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo])
      .toString()
      .trim(),
  );

const spec = JSON.parse(readFileSync(resolve(AQUI, "narracao.json"), "utf8"));

const PAD = 1.1; // respiro entre o fim da fala e o corte
const MIN_CENA = 3.5;
const MAX_TOTAL = 176; // margem sobre os 3 minutos do regulamento

const cenas = spec.scenes.map((c) => {
  const audio = resolve(AUDIO, `${c.id}.mp3`);
  if (!existsSync(audio)) throw new Error(`áudio ausente: ${audio} — rode a etapa de TTS`);
  const audioDur = duracao(audio);
  let mediaDur = 0;
  if (c.tipo === "clip") {
    const clip = resolve(CLIPS, `${c.id}.mp4`);
    if (!existsSync(clip)) throw new Error(`clipe ausente: ${clip} — rode video/record.mjs`);
    mediaDur = duracao(clip);
  }
  return { ...c, audioDur, mediaDur, dur: Math.max(MIN_CENA, audioDur + PAD) };
});

const soma = cenas.reduce((s, c) => s + c.dur, 0);
const fator =
  soma > MAX_TOTAL ? (MAX_TOTAL - cenas.length * MIN_CENA) / (soma - cenas.length * MIN_CENA) : 1;
for (const c of cenas) {
  if (fator < 1) c.dur = Math.max(MIN_CENA, c.audioDur * fator + Math.min(PAD, 0.6));
}

let t = 0;
for (const c of cenas) {
  c.start = Number(t.toFixed(2));
  c.dur = Number(c.dur.toFixed(2));
  t += c.dur;
}
const total = Number(t.toFixed(2));

for (const c of cenas) {
  if (c.tipo === "clip" && c.mediaDur < c.dur) {
    console.warn(
      `aviso: ${c.id} tem clipe de ${c.mediaDur.toFixed(1)}s e precisa de ${c.dur}s — ` +
        `aumente as pausas em video/record.mjs (o último quadro congela)`,
    );
  }
}

rmSync(PROJETO, { recursive: true, force: true });
mkdirSync(MEDIA, { recursive: true });
mkdirSync(COMPS, { recursive: true });

const copiar = (src, nome) => copyFileSync(src, resolve(MEDIA, nome));

// O render pinta o quadro do vídeo no tamanho natural do arquivo dentro do box do elemento.
// Por isso o clipe é reescalado para o tamanho exato da tela do celular (406x908) e cortado
// na duração da cena — assim não depende de CSS nem de data-media-start.
const LEAD = 1.0;
const TELA_LARGURA = 406;
const TELA_ALTURA = 908;
function extrairPoster(origem, destino) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", origem, "-frames:v", "1", destino]);
}

function normalizarClipe(origem, destino, dur) {
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-ss", String(LEAD), // descarta o começo em branco: a gravação começa antes da página pintar
    "-i", origem,
    "-t", String(dur),
    "-vf", `scale=${TELA_LARGURA}:${TELA_ALTURA}:flags=lanczos,setsar=1,fps=30`,
    "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
    destino,
  ]);
}

// ---------- CSS compartilhado ----------
const CSS = `
  :root {
    --papel: #FDFBF7; --tinta: #1E293B; --tinta-fraca: #475569; --regua: #D9D4C7;
    --turquesa: #006B8E; --ambar: #CC7A00; --fonte: Lato, Roboto, "DejaVu Sans", sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; background: var(--papel); }
  body { font-family: var(--fonte); color: var(--tinta); }
  #root, .palco { position: relative; width: 1920px; height: 1080px; background: var(--papel); overflow: hidden; }
  .clip { position: absolute; inset: 0; }

  .app { display: grid; grid-template-columns: 760px 1fr; align-items: center; }
  .coluna-texto { padding-left: 96px; padding-right: 40px; }
  .kicker { font-size: 28px; font-weight: 900; letter-spacing: 0.16em; color: var(--ambar); margin-bottom: 22px; }
  .titulo { font-size: 62px; line-height: 1.04; letter-spacing: -0.02em; font-weight: 900; margin-bottom: 24px; }
  .linha { font-size: 30px; line-height: 1.4; color: var(--tinta-fraca); max-width: 620px; }

  .celular { position: relative; justify-self: center; width: 430px; height: 932px; transform: scale(0.92);
             border-radius: 54px; padding: 12px; background: #10202A;
             box-shadow: 0 34px 70px rgba(16, 32, 42, 0.28), inset 0 0 0 2px #334552; overflow: hidden; }
  .tela { display: block; border-radius: 42px; }
  .poster { position: absolute; top: 12px; left: 12px; z-index: 0; }

  .cartela { display: flex; align-items: center; }
  .cartela-texto { padding: 0 200px; }
  .titulo-cartela { font-size: 92px; line-height: 1.02; letter-spacing: -0.03em; font-weight: 900; max-width: 1400px; }
  .linha-cartela { font-size: 34px; line-height: 1.45; color: var(--tinta-fraca); margin-top: 34px; max-width: 1180px; }

  .final { display: flex; align-items: center; justify-content: center; text-align: center; }
  .titulo-final { font-size: 150px; letter-spacing: -0.04em; font-weight: 900; line-height: 1; }
  .linha-final { font-size: 40px; color: var(--tinta-fraca); margin-top: 18px; }
  .selo-final { font-size: 28px; font-weight: 900; letter-spacing: 0.14em; color: var(--turquesa); margin-top: 44px; }

  .diagrama { display: grid; grid-template-columns: 700px 1fr; align-items: center; }
  .fluxo { display: flex; align-items: center; gap: 18px; padding-right: 96px; position: relative; }
  .no { flex: 1; background: #FFFFFF; border: 3px solid var(--regua); border-radius: 22px; padding: 26px 22px;
        box-shadow: 0 6px 0 var(--regua); }
  .no-destaque { border-color: var(--turquesa); box-shadow: 0 6px 0 #007EA7; }
  .no-rotulo { display: block; font-size: 30px; font-weight: 900; margin-bottom: 8px; }
  .no-detalhe { display: block; font-size: 24px; color: var(--tinta-fraca); line-height: 1.35; }
  .seta { font-size: 40px; color: var(--turquesa); font-weight: 900; }
  .rodape-fluxo { position: absolute; left: 0; bottom: -86px; font-size: 24px; color: var(--tinta-fraca); }
`;

// ---------- corpo de cada cena ----------
function corpoCena(c) {
  const audio = `<audio id="audio-${c.id}" class="clip" data-start="0" data-duration="${c.audioDur.toFixed(2)}" data-track-index="9" src="../media/${c.id}.mp3"></audio>`;

  if (c.tipo === "cartela") {
    return `${audio}
    <div class="cartela-texto">
      <p class="kicker" data-layout-ignore>${c.kicker}</p>
      <h1 class="titulo-cartela">${c.titulo}</h1>
      <p class="linha-cartela">${c.linha}</p>
    </div>`;
  }

  if (c.tipo === "diagrama") {
    return `${audio}
    <div class="coluna-texto">
      <p class="kicker" data-layout-ignore>${c.kicker}</p>
      <h2 class="titulo">${c.titulo}</h2>
      <p class="linha">${c.linha}</p>
    </div>
    <div class="fluxo">
      <div class="no">
        <span class="no-rotulo">Aparelho</span>
        <span class="no-detalhe" data-layout-ignore>IndexedDB · log append-only</span>
      </div>
      <div class="seta">→</div>
      <div class="no no-destaque">
        <span class="no-rotulo">Servidor</span>
        <span class="no-detalhe" data-layout-ignore>/api/events · só agrega</span>
      </div>
      <div class="seta">→</div>
      <div class="no">
        <span class="no-rotulo">Painel</span>
        <span class="no-detalhe" data-layout-ignore>respostas por tema</span>
      </div>
      <div class="rodape-fluxo" data-layout-ignore>sem estado central · sem conflito · abre offline</div>
    </div>`;
  }

  if (c.tipo === "final") {
    return `${audio}
    <div class="cartela-texto" style="padding:0">
      <h1 class="titulo-final">${c.titulo}</h1>
      <p class="linha-final">${c.linha}</p>
      <p class="selo-final" data-layout-ignore>${c.kicker}</p>
    </div>`;
  }

  // cena com clipe do app dentro da moldura de celular
  return `${audio}
    <div class="coluna-texto">
      <p class="kicker" data-layout-ignore>${c.kicker}</p>
      <h2 class="titulo">${c.titulo}</h2>
      <p class="linha">${c.linha}</p>
    </div>
    <div class="celular">
      <img class="tela poster" src="../media/${c.id}-poster.png" alt="" />
      <video id="video-${c.id}" class="tela" data-start="0" data-duration="${c.dur}"
             data-track-index="1" muted playsinline preload="auto"
             src="../media/${c.id}.mp4"></video>
    </div>`;
}

function htmlCena(c) {
  // a primeira cena nasce visível: o quadro 0 é a miniatura nos players
  const semFade = c.id === "cena1";
  const classe = c.tipo === "clip" ? "app" : c.tipo;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${c.id}</title>
<script src="../gsap.min.js"></script>
<style>${CSS}</style>
</head>
<body>
<div id="root" data-composition-id="${c.id}"
     data-start="0" data-duration="${c.dur}" data-width="1920" data-height="1080">
  <div class="palco ${classe}">
  ${corpoCena(c)}
  </div>
</div>
<script>
  const tl = gsap.timeline({ paused: true, duration: ${c.dur} });
  const alvos = document.querySelectorAll(
    ".kicker, .titulo, .linha, .titulo-cartela, .linha-cartela, .titulo-final, .linha-final, .selo-final, .no, .seta, .rodape-fluxo",
  );
  tl.fromTo(
    alvos,
    { opacity: ${semFade ? 1 : 0}, y: ${semFade ? 18 : 26} },
    { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 },
    0,
  );
  window.__timelines = window.__timelines || {};
  window.__timelines["${c.id}"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;
}

// ---------- raiz ----------
const hosts = cenas
  .map(
    (c) =>
      `    <div id="host-${c.id}" class="clip" data-composition-id="host-${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${c.start}" data-duration="${c.dur}" data-track-index="0"></div>`,
  )
  .join("\n");

const raiz = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Mosaico — demo Hack Brasil 2026</title>
<script src="gsap.min.js"></script>
<style>${CSS}
  .marca { position: absolute; top: 56px; left: 96px; display: flex; align-items: center; gap: 14px; z-index: 5; }
  .marca-ponto { width: 26px; height: 26px; border-radius: 8px; background: var(--turquesa); box-shadow: 0 4px 0 #007EA7; }
  .marca-nome { font-size: 30px; font-weight: 900; letter-spacing: -0.01em; }
  .rodape { position: absolute; bottom: 48px; left: 96px; right: 96px; display: flex; justify-content: space-between;
            align-items: center; font-size: 22px; color: var(--tinta-fraca); z-index: 5; }
  .trilha { position: absolute; bottom: 84px; left: 96px; right: 96px; height: 4px; background: var(--regua);
            border-radius: 2px; overflow: hidden; z-index: 5; }
  .trilha-cheia { height: 100%; width: 0%; background: var(--turquesa); }
</style>
</head>
<body>
<div id="root" class="palco" data-composition-id="mosaico-demo" data-start="0" data-duration="${total}"
     data-width="1920" data-height="1080">
${hosts}

  <audio id="trilha" class="clip" data-start="0" data-duration="${total}" data-track-index="8" src="media/trilha.mp3"></audio>

  <div class="marca" data-layout-ignore>
    <span class="marca-ponto"></span>
    <span class="marca-nome">Mosaico</span>
  </div>
  <div class="trilha"><div class="trilha-cheia" id="trilha-cheia"></div></div>
  <div class="rodape" data-layout-ignore>
    <span>Hack Brasil 2026 · Trilha Acesso à Educação</span>
    <span>offline-first · conteúdo curado · zero dado pessoal</span>
  </div>
</div>
<script>
  const tl = gsap.timeline({ paused: true, duration: ${total} });
  tl.to("#trilha-cheia", { width: "100%", duration: ${total}, ease: "none" }, 0);
  window.__timelines = window.__timelines || {};
  window.__timelines["mosaico-demo"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;

writeFileSync(resolve(PROJETO, "index.html"), raiz);
for (const c of cenas) {
  writeFileSync(resolve(COMPS, `${c.id}.html`), htmlCena(c));
  copiar(resolve(AUDIO, `${c.id}.mp3`), `${c.id}.mp3`);
  if (c.tipo === "clip") {
    normalizarClipe(resolve(CLIPS, `${c.id}.mp4`), resolve(MEDIA, `${c.id}.mp4`), c.dur);
    extrairPoster(resolve(MEDIA, `${c.id}.mp4`), resolve(MEDIA, `${c.id}-poster.png`));
  }
}
copyFileSync(resolve(AQUI, "gsap.min.js"), resolve(PROJETO, "gsap.min.js"));
copiar(resolve(AUDIO, "trilha.mp3"), "trilha.mp3");
writeFileSync(
  resolve(PROJETO, "meta.json"),
  JSON.stringify({ id: "mosaico-demo", name: "Mosaico — demo Hack Brasil 2026" }, null, 2),
);

console.log(
  cenas
    .map((c) => `${c.id.padEnd(6)} ${String(c.start).padStart(6)}s +${String(c.dur).padStart(5)}s  ${c.tipo}`)
    .join("\n"),
);
console.log(`\ntotal: ${total}s (${Math.floor(total / 60)}m${String(Math.round(total % 60)).padStart(2, "0")}s)`);
if (total > 180) throw new Error(`vídeo acima de 3 minutos: ${total}s`);
