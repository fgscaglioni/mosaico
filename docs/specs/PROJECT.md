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

**Fontes (verificadas em 2026-11-27):** [Regulamento](https://hackbrasil.com/regulamento) ·
[Termos de uso](https://hackbrasil.com/termos) (atualizados em 02/11/2026) ·
[Política de privacidade](https://hackbrasil.com/privacidade) (atualizada em 03/11/2026).
Operadora: AI TECH SPACE LLC, sociedade de Delaware, EUA. Comissão Organizadora: Nicolas
Silberstein Camara, Nicole Grossmann e Matheus Pagani (item 1.2). Contato: `oi@hackbrasil.com`.
Leis aplicáveis: Estado de Delaware (Regulamento item 14.2, Privacidade item 8).

| Item do regulamento | Regra que afeta o projeto |
|---|---|
| 1.3 | Concurso exclusivamente cultural (Lei 5.768/1971, art. 3º, II); dados dos participantes não são vendidos nem cedidos para fins comerciais |
| 4.1 | Times de 1 a 4 integrantes, um único time e uma única submissão por pessoa — SIGNAL é solo |
| 5.2 | Trilha Acesso à educação: o app ajuda crianças a aprender e professores a ensinar; fora da trilha ficam assistentes de uso geral sem foco em aprendizado e ferramentas para colar em provas |
| 6.1 | Repositório criado depois de 04/11 21h, sem fork e sem histórico importado |
| 6.2 | Nenhum código anterior não público; nada copiado de outros repositórios do time |
| 6.3 | Escolha de tecnologia livre; nenhuma ferramenta de patrocinador é exigida, e o peso da tecnologia entra só no critério de implementação (9.1) |
| 6.4 | Ferramentas de IA são permitidas e recomendadas |
| 6.6 | Licença não pode impedir o júri de ler e executar: MIT |
| 6.7 | Repositório público até 15/12 no mínimo |
| 6.8 | Proibido conteúdo adulto, violência gráfica, gore, discurso de ódio — o app é **contra** esses temas e não descreve violência |
| 6.9 | Demo sem dados pessoais reais de terceiros |
| 7.1 | Vale a última versão enviada até 30/11 23h59; só contam os commits do repositório até esse horário |
| 7.2 | Submissão exige nome, descrição, trilha, links de repositório e demo, vídeo de até 3 min sem login (pt ou en, item 9.8), **aceite do Regulamento e autorização de compartilhamento dos dados do time e do projeto (item 13.1)** — sem isso a submissão não é enviada |
| 7.3 | Demo precisa continuar no ar durante a avaliação |
| 7.4 | Jurados não são obrigados a instalar nem executar o projeto; podem avaliar por código, demo e vídeo — README precisa bastar para entender e rodar |
| 8.1 | Finalistas: 5 projetos elegíveis mais bem avaliados por trilha, com nota mínima de 20/40 (item 9.4); vagas podem migrar entre trilhas |
| 8.4 | Entre 30/11 23h59 e a final (12/12, São Paulo) os repositórios ficam **congelados**: sem commits nem mudança de código; o desenvolvimento retoma no local da final. Commit no período congelado pode desclassificar |
| 9.1 | Quatro critérios de peso igual, nota 0–10 cada, total 0–40: execução, implementação, impacto, comunicação |
| 9.4 | Nota mínima de 20/40 na fase online para ir à final |
| 11.1 | Propriedade intelectual do projeto pertence ao time; à Realizadora e aos parceiros cabe só licença para exibir nome, descrição, imagens, vídeo e link na divulgação (11.2) |
| 13.1 | Ao submeter, o time autoriza: jurados e mentores recebem a submissão e os contatos; patrocinadores e parceiros recebem os dados do projeto; o patrocinador do prêmio recebe nome e e-mail dos integrantes só para entregar o prêmio |
| 13.2 | Nome e e-mail só são compartilhados para contato pós-hackathon com autorização opcional no painel; não afeta avaliação e pode ser retirada |
| 13.3 | Participar autoriza, sem custo, uso de nome, imagem e voz captados em encontros, livestreams e final para divulgação; quem não quiser aparecer avisa no local — relevante para o vídeo com o integrante na câmera |

**Privacidade: dois planos, não confundir.** A Política de Privacidade da organização
(03/11/2026) trata dos dados do **time na inscrição e na submissão** (LGPD/GDPR, direitos
no item 5, compartilhamento com patrocinadores e prestadores no item 4, processamento
automatizado/IA no item 1.4). O **app Mosaico** não coleta dado pessoal de criança nenhuma:
política de dados no §9 e ADR-0004 (zero dados pessoais por desenho). Nenhuma tela do app
promete nem reproduz os Termos de Uso ou a Política do Hack Brasil; a referência legal do
app é a curadoria de conteúdo (fontes BNCC/ECA/MEC por carta, §8).
