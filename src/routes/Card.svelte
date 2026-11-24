<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, loadCard, recordAnswer, retry, clearFeedback } from "../lib/store.svelte";
  import { catalog } from "../lib/content";
  import Icon from "../lib/Icon.svelte";

  let selectedOption = $state<number | null>(null);
  let feedbackVisible = $state(false);
  let feedbackType = $state<"correct" | "wrong" | null>(null);

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
    if (store.feedback) {
      feedbackType = store.feedback.type;
      feedbackVisible = true;
    }
  }

  function closeFeedback() {
    feedbackVisible = false;
    feedbackType = null;
    clearFeedback();
  }

  function handleRetry() {
    retry();
    selectedOption = null;
    closeFeedback();
  }

  function nextCard() {
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
    closeFeedback();
  }

  function goBack() {
    navigate("/tema");
  }
</script>

{#if store.currentCard}
  <header class="topo">
    <button class="voltar" onclick={goBack} aria-label="Voltar aos temas">
    <Icon name="arrow-left" size={24} />
  </button>
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
  </main>

  {#if feedbackVisible && store.feedback}
    <div class="modal-overlay">
      <!-- Partículas de celebração no acerto -->
      {#if feedbackType === "correct"}
        <div class="particulas" aria-hidden="true">
          <span class="particula p1">✦</span>
          <span class="particula p2">★</span>
          <span class="particula p3">●</span>
          <span class="particula p4">✦</span>
          <span class="particula p5">★</span>
          <span class="particula p6">●</span>
        </div>
      {/if}

      <div
        class="modal"
        class:sucesso={feedbackType === "correct"}
        class:erro={feedbackType === "wrong"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        aria-describedby="modal-mensagem"
        aria-live="polite"
      >
        <div class="modal-conteudo">
          <div class="modal-icone" aria-hidden="true">
            {#if feedbackType === "correct"}
              <Icon name="check" size={72} />
            {:else}
              <Icon name="x" size={72} />
            {/if}
          </div>

          <h2 id="modal-titulo" class="modal-titulo">
            {feedbackType === "correct" ? "Muito bem!" : "Não foi dessa vez"}
          </h2>

          <span class="modal-xp">+{store.feedback.xp} XP</span>

          <p id="modal-mensagem" class="modal-mensagem">{store.feedback.message}</p>

          <div class="modal-fonte">
            <span class="rotulo">Fonte</span>
            <span>{store.currentCard.source}</span>
          </div>

          <div class="modal-acoes">
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
        </div>
      </div>
    </div>
  {/if}
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

  .carregando {
    text-align: center;
    padding-top: 48px;
  }

  /* Modal overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(27, 24, 21, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
    overflow: hidden;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Modal genérico */
  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--paper);
    border-radius: var(--raio);
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
    position: relative;
    z-index: 1;
  }

  /* Animação no Acerto: pop saltitante e luminoso */
  .modal.sucesso {
    border-top: 6px solid var(--ok);
    animation: sucessoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes sucessoPop {
    0% {
      opacity: 0;
      transform: scale(0.7) translateY(40px);
    }
    70% {
      transform: scale(1.04) translateY(-8px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Animação no Erro: tremor pedagógico (shake suave) */
  .modal.erro {
    border-top: 6px solid var(--erro);
    animation: erroShake 0.45s ease-in-out forwards;
  }

  @keyframes erroShake {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    30% {
      opacity: 1;
      transform: scale(1) translateX(-12px);
    }
    50% {
      transform: translateX(10px);
    }
    70% {
      transform: translateX(-6px);
    }
    90% {
      transform: translateX(3px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateX(0);
    }
  }

  .modal-icone {
    display: inline-block;
    line-height: 0;
    margin-bottom: var(--esp-3);
  }

  .modal.sucesso .modal-icone {
    color: var(--ok);
  }

  .modal.erro .modal-icone {
    color: var(--erro);
  }

  .modal.sucesso .modal-icone :global(svg) {
    animation: bounceRotate 0.6s var(--easing-pop) 0.1s both;
  }

  .modal.erro .modal-icone :global(svg) {
    animation: dropSway 0.5s var(--easing-suave) 0.1s both;
  }

  .modal-titulo {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--ink);
  }

  .modal.sucesso .modal-titulo {
    color: var(--ok);
  }

  .modal.erro .modal-titulo {
    color: var(--erro);
  }

  .modal-xp {
    display: inline-block;
    font-size: 15px;
    font-weight: 700;
    padding: 6px 16px;
    background: var(--ink);
    color: var(--paper);
    border-radius: var(--raio-botao);
    margin-bottom: 16px;
    animation: xpPop 0.5s ease-out 0.25s both;
  }

  @keyframes xpPop {
    0% { opacity: 0; transform: scale(0.7); }
    70% { transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }

  .modal-mensagem {
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink);
    opacity: 0.9;
    margin-bottom: 20px;
    text-align: left;
    background: rgba(0, 0, 0, 0.02);
    padding: 12px 16px;
    border-radius: var(--raio-botao);
    border: 1px solid var(--rule);
  }

  .modal-fonte {
    font-size: 12px;
    opacity: 0.7;
    margin-bottom: 24px;
    text-align: left;
  }

  .modal-fonte .rotulo {
    display: block;
    margin-bottom: 2px;
    font-weight: 600;
  }

  .modal-acoes {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .botao-tentar,
  .botao-proxima {
    width: 100%;
    min-height: 48px;
    border: none;
    border-radius: var(--raio-botao);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.1s;
  }

  .botao-tentar:active,
  .botao-proxima:active {
    transform: scale(0.98);
  }

  .botao-tentar {
    background: var(--ink);
    color: var(--paper);
  }

  .botao-proxima {
    background: var(--ok);
    color: var(--paper);
  }

  .botao-tentar:focus-visible,
  .botao-proxima:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 2px;
  }

  /* Partículas de celebração no acerto */
  .particulas {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .particula {
    position: absolute;
    font-size: 24px;
    color: var(--accent);
    animation: flutuar 1.2s ease-out forwards;
    opacity: 0;
  }

  .p1 { left: 20%; top: 40%; color: var(--ok); animation-delay: 0.05s; font-size: 28px; }
  .p2 { left: 35%; top: 30%; color: var(--accent); animation-delay: 0.15s; font-size: 22px; }
  .p3 { left: 65%; top: 35%; color: var(--tema-bullying); animation-delay: 0.1s; font-size: 18px; }
  .p4 { left: 80%; top: 45%; color: var(--ok); animation-delay: 0.2s; font-size: 26px; }
  .p5 { left: 25%; top: 60%; color: var(--tema-racismo); animation-delay: 0.25s; font-size: 20px; }
  .p6 { left: 75%; top: 65%; color: var(--accent); animation-delay: 0.18s; font-size: 22px; }

  @keyframes flutuar {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.5) rotate(0deg);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-80px) scale(1.2) rotate(180deg);
    }
  }

  @keyframes bounceRotate {
    0% { opacity: 0; transform: scale(0) rotate(-120deg); }
    60% { transform: scale(1.3) rotate(15deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
  }

  @keyframes dropSway {
    0% { opacity: 0; transform: translateY(-20px) scale(0.8); }
    50% { transform: translateY(6px) scale(1.1); }
    75% { transform: translateY(-3px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Respeito a quem prefere menos movimento */
  @media (prefers-reduced-motion: reduce) {
    .modal-overlay,
    .modal.sucesso,
    .modal.erro,
    .modal-xp,
    .particula,
    .modal.sucesso .modal-icone :global(svg),
    .modal.erro .modal-icone :global(svg) {
      animation: none !important;
    }

    .particulas {
      display: none;
    }

    .botao-tentar:active,
    .botao-proxima:active {
      transform: none;
    }
  }
</style>