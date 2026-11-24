# Tasks - catálogo de cartas curadas

Cada tarefa carrega `(R#)` do requisito e `(V#)` do critério da
[SPECIFICATION.md](./SPECIFICATION.md).

Ordem: esquema antes do conteúdo, conteúdo antes da tela. Sem migration: este projeto não tem banco.

## Fase 1 - esquema e gate

- [ ] `src/lib/content.ts` (novo): `CardSchema` e `CatalogSchema` em `zod`, export de `catalog`,
  `cardsOf(theme)` e `cardById(id)`. Depende de `content/cards.pt-BR.json`. (R2)
- [ ] `tests/cartas.test.ts` (novo): `catalogo_tem_vinte_cartas` e `toda_carta_passa_no_esquema`. (V1, V2)
- [ ] `tests/cartas.test.ts`: `carta_sem_fonte_reprova` e `carta_com_termo_proibido_reprova`, com
  fixtures inline inválidas e `expect(() => CatalogSchema.parse(...)).toThrow()`. (V3)

## Fase 2 - conteúdo

- [ ] `content/cards.pt-BR.json` (novo): as 8 cartas semente com fonte e explicação. (R1, R5)
- [ ] `content/cards.pt-BR.json`: as 12 cartas restantes, 3 por tema, seguindo a rubrica do
  `PROJECT.md` §8. (R1, R5)
- [ ] `content/cards.pt-BR.json`: `review_status` de cada carta passa a `revisado` depois da leitura
  humana; nenhuma carta fica em `rascunho` na entrega. (R2)
- [ ] `tests/cartas.test.ts`: `versao_do_catalogo_e_positiva`. (V4)

## Fase 3 - testes e documentação

- [ ] `tests/cartas.test.ts`: varredura de `explanation` e `stem` contra a lista proibida, cobrindo V5. (V5)
- [ ] Suíte verde: `npm test -- tests/cartas.test.ts` com 5 testes passando. (V1, V2, V3, V4, V5)
- [ ] `docs/specs/STATE.md`: registrar a contagem de cartas revisadas.

## Verificação no ambiente real

- [ ] `npm run dev`, abrir `#/` e confirmar 4 temas com 5 cartas cada na contagem exibida. (V1)
- [ ] `grep -c '"review_status": "rascunho"' content/cards.pt-BR.json` devolve `0`. (R2)
