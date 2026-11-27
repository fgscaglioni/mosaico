# PROJECT.md — Mosaico

**Status:** Approved · **Data:** 2026-11-24 · **Prazo:** 2026-11-30 23h59 (America/Sao_Paulo)
**Time:** SIGNAL (um integrante) · **Trilha:** Acesso à educação · **Evento:** Hack Brasil 2026

---

## 1. Problema

Crianças do Ensino Fundamental convivem com bullying, racismo, xenofobia e violência de gênero, mas
raramente recebem conteúdo que ensine a **reconhecer, nomear e pedir ajuda**. A escola tem obrigação
curricular de tratar o tema — Educação em Direitos Humanos é um dos Temas Contemporâneos Transversais
da BNCC (MEC, 2019) e a Lei 14.164/2021 inclui a prevenção da violência contra a mulher nos currículos
da educação básica — e não tem material curto, offline e verificável para aplicar em dez minutos.

O professor de escola pública com turma de 35 a 40 alunos não consegue diagnosticar quem precisa de
quê, e o laboratório de informática costuma não ter internet estável.

## 2. Público

| Ordem | Público | O que precisa |
|---|---|---|
| Primário | Criança de 8 a 11 anos, Ensino Fundamental | Entender a cena, nomear o que aconteceu, saber a quem recorrer |
| Secundário | Professor que aplica tema transversal | Material pronto, com fonte, que roda sem rede |
| Terciário | Qualquer pessoa interessada | Acesso livre, sem conta |

## 3. Objetivo

Ensinar, em sessões de cinco minutos que funcionam sem internet, a reconhecer e responder a quatro
formas de violência cotidiana, com conteúdo curado e progresso que sobrevive à falta de rede.

## 4. Não-objetivos

- **Não é canal de denúncia.** Não recebe, não armazena e não encaminha relato de violência.
- **Não tem interação social.** Sem chat, sem texto livre, sem perfil, sem ranking entre crianças.
- **Não substitui** aula, acompanhamento pedagógico, psicólogo ou Conselho Tutelar.
- **Não mede aprendizagem real.** Mede comportamento dentro do app, e a documentação diz isso.
- **Não previne violência.** Ensina reconhecimento e busca de ajuda. O pitch não promete prevenção.

## 5. Escopo da entrega

| Item | Escopo |
|---|---|
| Conteúdo | 4 temas × 20 cartas = 80 cartas, cada uma com fonte, explicação e faixa etária |
| Gamificação | XP, nível, sequência de dias, 6 medalhas, álbum de peças por tema |
| Offline | PWA instalável, funcional após o primeiro carregamento |
| Sincronização | Log de eventos enviado quando a rede volta, com deduplicação |
| Painel | Página pública com agregado, sem identidade |
| Entrega | Repositório público, demo no ar, vídeo de até 3 minutos, README e docs |

## 6. Especificações de feature

Cada spec tem requisitos (`R#`), critérios de verificação (`V#`) e tarefas próprios. A numeração de
requisito vive dentro da spec; este documento não a duplica.

| Spec | Cobre | Requisitos |
|---|---|---|
| [cartas-curadas](features/cartas-curadas/SPECIFICATION.md) | catálogo, gate editorial, fonte, faixa etária | 5 |
| [ajuda-e-encaminhamento](features/ajuda-e-encaminhamento/SPECIFICATION.md) | tela de ajuda com canais públicos, sem relato | 5 |
| [pratica-gamificada](features/pratica-gamificada/SPECIFICATION.md) | XP, nível, sequência, medalhas, retomada, acessibilidade | 8 |
| [modo-offline](features/modo-offline/SPECIFICATION.md) | precache, IndexedDB, jogo sem rede | 5 |
| [sincronizacao-de-eventos](features/sincronizacao-de-eventos/SPECIFICATION.md) | log de eventos, deduplicação, agregado público | 7 |

## 7. Condições de entrega

Não são feature: são portas do evento, e nenhuma delas se prova com teste de unidade.

| Condição | Prova |
|---|---|
| Repositório público criado depois de 04/11 21h, sem fork nem histórico importado (6.1) | <https://github.com/fgscaglioni/mosaico>, primeiro commit em 24/11 |
| Licença que não impede o júri de ler, executar e testar (6.6) | `LICENSE` MIT na raiz |
| Demo pública, sem login, no ar durante a avaliação (7.3) | `curl https://<host>/api/health` devolve `ok` |
| Vídeo de até 3 minutos, acessível sem login (7.2) | link público, duração cronometrada |
| Build reproduzível em container | `docker build && docker run`, health responde |
| Conteúdo revisado por pessoa | `review_status: "revisado"` em todas as 80 cartas |

## 8. Política de conteúdo

1. **Faixa etária declarada em cada carta** (`8-11` ou `12-14`). O tom é afirmativo: o que fazer, não
   o que temer.
2. **Nada de descrição gráfica.** Sem relato de violência, sem detalhe de agressão, sem imagem de
   sofrimento. A carta descreve a cena e a resposta possível.
3. **Nenhum caso real identificável.** Situações genéricas e verossímeis, sem nome, cidade ou escola.
4. **Fonte obrigatória** por carta: lei, BNCC, ECA ou material do MEC. Sem fonte, a carta não entra.
5. **Explicação obrigatória**, com no mínimo 60 caracteres, terminando em algo acionável.
6. **Revisão humana** antes da submissão: `review_status` passa de `rascunho` para `revisado` só depois
   de leitura por adulto responsável.
7. **Tela de ajuda sempre alcançável**, com Disque 100, Ligue 180, CVV 188 e Conselho Tutelar.
8. **Lista de termos proibidos** verificada por teste automatizado.

## 9. Política de dados

1. Nenhum dado pessoal: sem nome, e-mail, telefone, foto, localização ou texto livre.
2. Identidade de aparelho é um UUID aleatório gerado no primeiro acesso, sem vínculo com pessoa.
3. O servidor guarda eventos de aprendizagem (carta, acerto, XP, dia) e mais nada.
4. O painel público só mostra agregado.
5. A participação não depende de fornecer dado além do estritamente necessário, o que atende ao
   art. 14, §4º da LGPD para aplicações com crianças.

## 10. Arquitetura

```
navegador (PWA)                         servidor (um container)
┌──────────────────────────┐            ┌─────────────────────────────┐
│ telas Svelte             │            │ server.mjs                  │
│ domínio puro (XP, nível, │  POST      │  /api/sync  → events.jsonl  │
│ sequência, medalhas)     │ ─────────► │  /api/aggregate             │
│ IndexedDB: log de eventos│  eventos   │  dist/ (assets do Vite)     │
│ service worker: precache │            │  volume: /app/data          │
└──────────────────────────┘            └─────────────────────────────┘
```

**Sincroniza evento, nunca estado.** Evento é imutável e a agregação é derivada, então não existe
conflito de sincronização — no máximo evento repetido, que o servidor descarta por `event_id`.

## 11. Decisões

| ADR | Decisão |
|---|---|
| [0001](decisions/0001-nome-mosaico.md) | O produto se chama Mosaico |
| [0002](decisions/0002-spa-svelte-vite-sem-sveltekit.md) | SPA em Svelte 5 + Vite, sem SvelteKit |
| [0003](decisions/0003-sincronizacao-por-log-de-eventos.md) | Sincronização por log de eventos append-only |
| [0004](decisions/0004-zero-dados-pessoais.md) | Zero dados pessoais por desenho |

## 12. Perguntas em aberto

1. **Quem revisa as 80 cartas** antes de 28/11? As 80 cartas existem em `rascunho` (catalog_version 2). Sem revisor nomeado, R5 e R6 passam no teste e falham no propósito.
2. **Onde a demo é publicada** (Coolify ou outra máquina)? Depende de acesso do responsável.
3. **O painel público entra na entrega** ou fica só a rota de agregado? Decide esforço de UI na Fase 3.

## 13. Restrições do evento (Hack Brasil 2026)

| Item do regulamento | Regra que afeta o projeto |
|---|---|
| 6.1 | Repositório criado depois de 04/11 21h, sem fork e sem histórico importado |
| 6.2 | Nenhum código anterior não público; nada copiado de outros repositórios do time |
| 6.6 | Licença não pode impedir o júri de ler e executar: MIT |
| 6.7 | Repositório público até 15/12 no mínimo |
| 6.8 | Proibido conteúdo adulto, violência gráfica, gore, discurso de ódio — o app é **contra** esses temas e não descreve violência |
| 6.9 | Demo sem dados pessoais reais de terceiros |
| 7.1 | Vale o último commit enviado até 30/11 23h59 |
| 7.2 | Vídeo de até 3 min sem login; demo no ar; aceite do regulamento |
| 7.3 | Demo precisa continuar no ar durante a avaliação |
| 8.4 | Depois de 30/11 23h59, commit no repositório entregue pode desclassificar |
| 9.1 | Quatro critérios de peso igual: execução, implementação, impacto, comunicação |
