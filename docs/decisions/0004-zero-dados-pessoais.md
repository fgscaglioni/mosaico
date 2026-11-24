# ADR 0004 — Zero dados pessoais por desenho

**Data:** 2026-11-24 · **Status:** aceita

## Contexto

O público é criança de 8 a 11 anos. O art. 14 da LGPD exige melhor interesse e, no §4º, proíbe
condicionar a participação em jogos e aplicações a dados além do estritamente necessário. Além da
obrigação legal, um app infantil com qualquer campo de texto livre cria dever de moderação — custo que
um projeto de cinco dias não sustenta e risco reputacional que o tema já carrega.

## Decisão

1. Nenhum campo de texto livre, nenhum nome, e-mail, telefone, foto, localização ou upload.
2. O aparelho recebe um UUID aleatório no primeiro acesso, sem vínculo com pessoa.
3. A identificação visual é um avatar gerado (animal e cor sorteados), não digitado.
4. O servidor guarda somente eventos de aprendizagem; o painel público só mostra agregado.
5. A tela de ajuda traz canais reais da rede pública (Disque 100, Ligue 180, CVV 188) e a orientação de
   falar com um adulto de confiança — o app não recebe relato.

## Alternativas rejeitadas

| Alternativa | Por que não |
|---|---|
| Login com nome e turma | Dado de criança sem necessidade; aumenta dever de guarda e moderação |
| Apelido digitado pela criança | Texto livre abre moderação e permite PII acidental |
| Comentário ou mural entre alunos | Superfície de assédio dentro de um app sobre assédio |
| Canal de denúncia dentro do app | Exigiria fluxo com adultos responsáveis, sigilo e obrigação legal que o projeto não cobre |

## Consequências

- Sem ranking entre crianças, sem comparação nominal; a gamificação é individual.
- Não há como recuperar progresso em outro aparelho sem exportar o log manualmente.
- A ausência de PII é argumento de pitch, não limitação: é o que torna o app aceitável em escola.
