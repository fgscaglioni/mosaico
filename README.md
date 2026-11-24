# Mosaico

Aplicativo educacional para crianças do Ensino Fundamental aprenderem, jogando e sem internet,
a reconhecer e responder a bullying, racismo, xenofobia e violência de gênero.

Cada carta entrega uma peça. O álbum só fecha quando a criança passa pelos quatro temas.

**Status:** especificação aprovada, código não iniciado (24/11/2026).
Entrega para o Hack Brasil 2026, trilha Acesso à educação.

## Por onde começar

| Quero | Leia |
|---|---|
| O que o produto é e quais requisitos precisa cumprir | [`docs/specs/PROJECT.md`](docs/specs/PROJECT.md) |
| Em que pé está a construção e qual é o próximo passo | [`docs/specs/STATE.md`](docs/specs/STATE.md) |
| Como construir: scaffold, comandos, ordem, tokens | [`docs/specs/IMPLEMENTATION.md`](docs/specs/IMPLEMENTATION.md) |
| Por que as decisões técnicas são essas | [`docs/decisions/`](docs/decisions/README.md) |

## Estrutura

```
mosaico/
├── README.md
└── docs/
    ├── specs/
    │   ├── PROJECT.md      # o que é, requisitos, política de conteúdo e de dados
    │   └── STATE.md        # fase atual, ambiente, bloqueios, próximo passo
    └── decisions/          # ADRs
```

O código (`src/`, `server.mjs`, `content/`, `tests/`, `e2e/`) nasce na Fase 1 do plano de
implementação, que fica no vault: `01-Projects/hackbr2026/Mosaico - Plano de implementacao`.

## Regras que não se negociam

- **Nenhum dado pessoal.** Sem nome, e-mail, foto, texto livre ou upload. O aparelho é identificado
  por um UUID anônimo gerado no primeiro acesso.
- **Conteúdo é curadoria, não geração.** Nenhuma carta é criada em tempo de execução; toda carta tem
  fonte declarada e passa por revisão humana.
- **Funciona sem rede.** Se um recurso novo não funciona offline, ele não entra.
- **O app ensina a reconhecer e pedir ajuda.** Ele não previne violência e não é canal de denúncia.

## Licença

MIT, sobre código e conteúdo. Ver [`LICENSE`](LICENSE).

O texto das cartas cita leis e documentos públicos (Lei 13.185/2015, Lei 7.716/1989, Lei 10.639/2003,
Lei 14.164/2021, ECA, BNCC), sem reprodução de material protegido. Se um recurso de terceiro entrar no
projeto (fonte tipográfica, ícone), o aviso da licença dele vai junto no repositório.
