# ADR 0001 — O produto se chama Mosaico

**Data:** 2026-11-24 · **Status:** aceita

## Contexto

O app é para criança de 8 a 11 anos, trata de bullying, racismo, xenofobia e violência de gênero, e
roda em escola pública. O nome precisava ser lúdico sem remeter a jogo, provocar curiosidade, ser fácil
de pronunciar e de buscar, e não ser infantilizado.

## Decisão

**Mosaico.** Peças diferentes formam uma imagem única, e o nome gera a mecânica: cada carta entrega
uma peça, o álbum começa vazio e só fecha quando a criança passa pelos quatro temas.

## Alternativas rejeitadas

| Nome | Motivo da rejeição |
|---|---|
| Lumi | Três apps infantis com o nome, dois de aprendizagem ("Lumi" antiaditivo, "Lumi Kids", "Clube da Lumi") |
| Kora | Existe app de segurança familiar e app de saúde com o nome; e o nome só diz "coração", sem o argumento do produto |
| Curia | Três aplicativos homônimos na loja |
| Peraí, Xereta, Cadê, Fala Sério, Peteca, Apito | Interjeição ou brinquedo: descartados por som ou por colisão no mesmo mercado (Xereta é nome de escola infantil) |

## Consequências

- O nome não é exclusivo para busca: `mosaico.com.br` pertence à Mosaico Tecnologia (Buscapé), então o
  app precisa de subtítulo fixo em loja, README e vídeo, e o repositório se chama `mosaico-app`.
- A mecânica deixa de ser XP solto e passa a ser álbum de peças, o que aumenta o escopo da gamificação
  em uma tela (a do álbum).
