# AGENTS.md — mosaico

## Onde mora o quê

| Documento | Caminho |
|---|---|
| Spec de feature (requisitos `R#`, verificação `V#`, tarefas) | `docs/specs/features/<kebab-case>/{SPECIFICATION.md,TASKS.md}` |
| Como construir (scaffold, comandos, ordem, tokens, armadilhas) | `docs/specs/IMPLEMENTATION.md` |
| Estado do projeto (fase, bloqueios, próximo passo) | `docs/specs/STATE.md` |
| Visão do produto e políticas de conteúdo e de dados | `docs/specs/PROJECT.md` |
| Decisão de arquitetura | `docs/decisions/ADR-<nnnn>-<slug>.md` |

Spec de feature nova entra em `docs/specs/features/`, uma pasta por comportamento, slug em kebab-case.
Não existe outra árvore de spec neste repositório.

## Regras que não se negociam

- Conteúdo é curadoria, não geração. Nenhuma carta é criada em tempo de execução.
- Toda carta tem `source` e `explanation`; o teste do catálogo falha se faltar.
- Zero dado pessoal: sem nome, e-mail, texto livre, foto ou upload.
- `src/lib/domain/` é puro: sem DOM, sem IndexedDB, sem `fetch`.
- O app funciona sem rede. Recurso novo que não funciona offline não entra.
- Toda tarefa de `TASKS.md` que toca `src/`, `tests/` ou `e2e/` cita o `R#` ou o `V#` que cumpre.
- Todo `R#` da `SPECIFICATION.md` tem ao menos uma tarefa que o cumpre. `tests/specs.test.ts` falha se não.
- Antes de commit: `npm run gate` (svelte-check + unit + e2e). O CI roda o mesmo comando.
- Commit `tipo(escopo): descrição`, em português.
