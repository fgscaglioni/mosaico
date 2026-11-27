#!/bin/bash
# Monta o vídeo final da submissão: falas do integrante (gravacao-editada.mp4)
# intercaladas com trechos silenciosos da demo (mosaico-demo.mp4).
# Saída: video/out/mosaico-final.mp4 (1920x1080, <= 180 s, item 7.2 do regulamento).
set -euo pipefail

SRC="video/out/gravacao-editada.mp4"   # câmera vertical 720x1280, com áudio
DEMO="video/out/mosaico-demo.mp4"      # 1920x1080, narração TTS
TMP="video/out/final-tmp"
OUT="video/out/mosaico-final.mp4"
mkdir -p "$TMP"

# Câmera: vertical -> 1920x1080 com fundo desfocado (blur do próprio quadro)
CAM_FMT="split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=40[bg];[b]scale=607:1080[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p,fps=30[outv]"

cam() { # $1=inicio $2=fim $3=saida
  local dur
  dur=$(awk -v a="$1" -v b="$2" 'BEGIN{printf "%.2f", b-a}')
  ffmpeg -y -v error -ss "$1" -t "$dur" -i "$SRC" \
    -filter_complex "$CAM_FMT" -map "[outv]" -map 0:a \
    -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k -ar 48000 -ac 2 "$3"
}
demo() { # $1=inicio $2=fim $3=saida  (trecho silencioso: a voz é a do integrante)
  local dur
  dur=$(awk -v a="$1" -v b="$2" 'BEGIN{printf "%.2f", b-a}')
  ffmpeg -y -v error -ss "$1" -t "$dur" -i "$DEMO" \
    -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -filter_complex "format=yuv420p,fps=30[outv]" -map "[outv]" -map 1:a -shortest \
    -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k -ar 48000 -ac 2 "$3"
}

# Timeline (tempos da transcrição whisper base, pt-BR):
#  0.00- 26.32 intro + problema
# 26.48- 49.92 80 cartas, fontes, nada gerado na hora
# 49.92- 69.76 demonstração guiada: tema, embaralhamento, XP, medalhas, ajuda
# 69.76-105.84 offline first, log de eventos, zero dados pessoais, sync
# 107.68-121.60 fase experimental e revisão humana
# Demo (fronteiras aproximadas pelas durações das narrações cenaN.mp3):
#  cena2+3 (produto + offline): 24-49 · cena4 (sync/painel): 56-69
#  cena7 (ajuda): 109-119 · cena8 (fechamento): 124-130
cam  0.00  26.32 "$TMP/s1.mp4"
cam 26.48  49.92 "$TMP/s2.mp4"
cam 49.92  69.76 "$TMP/s3.mp4"
demo 24.00 49.00 "$TMP/s4.mp4"
cam 69.76 105.84 "$TMP/s5.mp4"
demo 56.00 69.00 "$TMP/s6.mp4"
demo 109.00 119.00 "$TMP/s7.mp4"
cam 107.68 121.60 "$TMP/s8.mp4"
demo 124.00 130.00 "$TMP/s9.mp4"

# Concatena com fade de saída nos últimos 2 s
for i in 1 2 3 4 5 6 7 8 9; do echo "file 's$i.mp4'"; done > "$TMP/lista.txt"
ffmpeg -y -v error -f concat -safe 0 -i "$TMP/lista.txt" \
  -c copy "$TMP/junto.mp4"
TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/junto.mp4")
ffmpeg -y -v error -i "$TMP/junto.mp4" \
  -af "afade=t=out:st=$(python3 -c "print(max(0, $TOTAL - 2))"):d=2" \
  -c:v copy -c:a aac -b:a 128k "$OUT"

echo "--- resultado ---"
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_type,width,height -of default=noprint_wrappers=1 "$OUT"
