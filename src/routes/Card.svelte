<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, loadCard, recordAnswer, retry, clearFeedback } from "../lib/store.svelte";
  import { catalog } from "../lib/content";

  let selectedOption = $state<number | null>(null);

  onMount(async () => {
    await initStore();
    const hash = window.location.hash.slice(1);
    const cardId = hash.replace("/carta/", "");
    if (cardId === "next") {
      const nextId = store.queue.find((id: string) => {
        const c = catalog.cards.find((x) => x.id === id);
        return c?.theme === store.currentTheme;
      });
      if (nextId) {
        loadCard(nextId);
      } else {
        navigate("/tema");
      }
    } else {
      loadCard(cardId);
    }
  });

  function selectOption(index: number) {
    if (store.feedback) return;
    selectedOption = index;
  }

  async function submitAnswer() {
    if (selectedOption === null || !store.currentCard) return;
    await recordAnswer(store.currentCard.id, selectedOption);
    selectedOption = null;
  }

  function handleRetry() {
    retry();
    selectedOption = null;
  }

  function nextCard() {
    clearFeedback();
    const nextId = store.queue.find((id: string) => {
      const c = catalog.cards.find((x) => x.id === id);
      return c?.theme === store.currentTheme;
    });
    if (nextId) {
      loadCard(nextId);
      navigate(`#/carta/${nextId}`);
    } else {
      navigate("/tema");
    }
  }

  function goBack() {
    navigate("/tema");
  }
</script>

{#if store.currentCard}
  <header class="topo">
    <button class="voltar" onclick={goBack} aria-label="Voltar aos temas">←</button>
    <div class="tema-badge" style="--tema-cor: var(--tema-{store.currentCard.theme})">
      <span class="tema-ponto"></span>
      <span>{store.currentCard.theme}</span>
    </div>
    <span class="tentativa">Tentativa {store.attempt}</span>
  </header>

  <main class="tela-carta">
    <div class="objetivo">
      <span class="rotulo">Objetivo</span>
      <p>{store.currentCard.objective}</p>
    </div>

    <section class="enunciado" aria-label="Enunciado da pergunta">
      <p>{store.currentCard.stem}</p>
    </section>

    <div class="alternativas" role="radiogroup" aria-label="Opções de resposta">
      {#each store.currentCard.options as option, index}
        <button
          class="opcao"
          class:selecionada={selectedOption === index}
          class:correta={store.feedback && index === store.currentCard.answer_index}
          class:incorreta={store.feedback && selectedOption === index && index !== store.currentCard.answer_index}
          disabled={!!store.feedback}
          onclick={() => selectOption(index)}
          role="radio"
          aria-checked={selectedOption === index}
        >
          <span class="opcao-letra">{String.fromCharCode(65 + index)}</span>
          <span class="opcao-texto">{option}</span>
        </button>
      {/each}
    </div>

    {#if !store.feedback}
      <button
        class="botao-confirmar"
        disabled={selectedOption === null}
        onclick={submitAnswer}
      >
        Confirmar resposta
      </button>
    {/if}

    {#if store.feedback}
      <section
        class="feedback"
        class:sucesso={store.feedback.type === "correct"}
        class:erro={store.feedback.type === "wrong"}
        aria-live="polite"
      >
        <div class="feedback-cabecalho">
          <span class="feedback-icone">
            {store.feedback.type === "correct" ? "✓" : "✗"}
          </span>
          <span class="feedback-titulo">
            {store.feedback.type === "correct" ? "Muito bem!" : "Não foi dessa vez"}
          </span>
          <span class="feedback-xp">+{store.feedback.xp} XP</span>
        </div>

        <p class="feedback-mensagem">{store.feedback.message}</p>

        <div class="feedback-fonte">
          <span class="rotulo">Fonte</span>
          <span>{store.currentCard.source}</span>
        </div>

        <div class="feedback-acoes">
          {#if store.showRetry}
            <button class="botao-tentar" onclick={handleRetry}>
              Tentar novamente
            </button>
          {:else}
            <button class="botao-proxima" onclick={nextCard}>
              Próxima carta
            </button>
          {/if}
        </div>
      </section>
    {/if}
  </main>
{:else}
  <main class="tela-carta carregando">
    <p>Carregando carta...</p>
    <button onclick={goBack}>Voltar</button>
  </main>
{/if}

<style>
  .topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    max-width: 600px;
    margin: 0 auto;
  }

  .voltar {
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    font-size: 24px;
    color: var(--ink);
    cursor: pointer;
    border-radius: var(--raio-botao);
  }

  .voltar:hover,
  .voltar:focus-visible {
    background: var(--rule);
  }

  .tema-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .tema-ponto {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--tema-cor);
  }

  .tentativa {
    font-size: 13px;
    opacity: 0.7;
  }

  .tela-carta {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .objetivo {
    margin-bottom: 16px;
    padding: 8px 12px;
    background: var(--rule);
    border-radius: var(--raio-botao);
    font-size: 13px;
  }

  .objetivo p {
    margin: 4px 0 0;
  }

  .enunciado {
    font-size: 20px;
    line-height: 1.4;
    margin-bottom: 24px;
  }

  .alternativas {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .opcao {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--paper);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    text-align: left;
    color: var(--ink);
    cursor: pointer;
    min-height: 44px;
    transition: border-color 0.15s, background 0.15s;
  }

  .opcao:hover:not(:disabled),
  .opcao:focus-visible:not(:disabled) {
    border-color: var(--accent);
  }

  .opcao.selecionada {
    border-color: var(--accent);
    background: rgba(166, 61, 0, 0.05);
  }

  .opcao.correta {
    border-color: var(--ok);
    background: rgba(47, 107, 79, 0.1);
  }

  .opcao.incorreta {
    border-color: var(--erro);
    background: rgba(181, 52, 43, 0.1);
  }

  .opcao-letra {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--rule);
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .opcao.selecionada .opcao-letra {
    background: var(--accent);
    color: var(--paper);
  }

  .opcao.correta .opcao-letra {
    background: var(--ok);
    color: var(--paper);
  }

  .opcao.incorreta .opcao-letra {
    background: var(--erro);
    color: var(--paper);
  }

  .opcao-texto {
    font-size: 16px;
    line-height: 1.4;
    padding-top: 2px;
  }

  .botao-confirmar {
    width: 100%;
    min-height: 48px;
    background: var(--accent);
    color: var(--paper);
    border: none;
    border-radius: var(--raio-botao);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .botao-confirmar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .feedback {
    border-radius: var(--raio);
    padding: 20px;
    margin-top: 24px;
  }

  .feedback.sucesso {
    background: rgba(47, 107, 79, 0.1);
    border: 2px solid var(--ok);
  }

  .feedback.erro {
    background: rgba(181, 52, 43, 0.1);
    border: 2px solid var(--erro);
  }

  .feedback-cabecalho {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .feedback-icone {
    font-size: 20px;
    font-weight: 700;
  }

  .feedback.sucesso .feedback-icone {
    color: var(--ok);
  }

  .feedback.erro .feedback-icone {
    color: var(--erro);
  }

  .feedback-titulo {
    font-size: 18px;
    font-weight: 700;
    flex: 1;
  }

  .feedback-xp {
    font-size: 14px;
    font-weight: 700;
    padding: 4px 8px;
    background: var(--ink);
    color: var(--paper);
    border-radius: var(--raio-botao);
  }

  .feedback-mensagem {
    font-size: 15px;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .feedback-fonte {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--rule);
  }

  .feedback-fonte .rotulo {
    display: block;
    margin-bottom: 2px;
  }

  .feedback-acoes {
    display: flex;
    gap: 12px;
  }

  .botao-tentar,
  .botao-proxima {
    width: 100%;
    min-height: 44px;
    border: none;
    border-radius: var(--raio-botao);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .botao-tentar {
    background: var(--ink);
    color: var(--paper);
  }

  .botao-proxima {
    background: var(--ok);
    color: var(--paper);
  }

  .carregando {
    text-align: center;
    padding-top: 48px;
  }
</style>