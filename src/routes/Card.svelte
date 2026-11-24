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
    color: var(--text-primary);
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
    margin-bottom: var(--esp-5);
    padding: var(--esp-3) var(--esp-4);
    background: var(--bg-secondary);
    border-radius: var(--raio-botao);
    font-size: var(--texto-sm);
    color: var(--text-secondary);
  }

  .objetivo p {
    margin: var(--esp-1) 0 0;
    color: var(--text-primary);
  }

  .enunciado {
    font-size: var(--texto-lg);
    line-height: 1.4;
    margin-bottom: var(--esp-8);
  }

  .alternativas {
    display: flex;
    flex-direction: column;
    gap: var(--esp-4);
    margin-bottom: var(--esp-6);
  }

  .opcao {
    display: flex;
    align-items: flex-start;
    gap: var(--esp-3);
    padding: var(--esp-5);
    background: var(--bg-secondary);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    text-align: left;
    color: var(--text-primary);
    cursor: pointer;
    min-height: var(--alvo-acao);
    box-shadow: 0 4px 0 var(--rule);
    transition: border-color var(--dur-rapida), transform var(--dur-rapida), box-shadow var(--dur-rapida), background var(--dur-rapida);
  }

  .opcao:hover:not(:disabled),
  .opcao:focus-visible:not(:disabled) {
    border-color: var(--color-primary-strong);
  }

  .opcao:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 var(--rule);
  }

  .opcao.selecionada {
    border-color: var(--color-primary-strong);
    background: var(--bg-secondary);
    box-shadow: 0 4px 0 var(--color-primary-shadow);
  }

  .opcao.correta {
    border-color: var(--color-success-strong);
    background: var(--bg-secondary);
    box-shadow: 0 4px 0 var(--color-success-shadow);
  }

  .opcao.incorreta {
    border-color: var(--color-error-strong);
    background: var(--bg-secondary);
    box-shadow: 0 4px 0 var(--color-error-shadow);
  }

  .opcao-letra {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--rule);
    color: var(--text-primary);
    font-size: var(--texto-sm);
    font-weight: 700;
    flex-shrink: 0;
  }

  .opcao.selecionada .opcao-letra {
    background: var(--color-primary);
    color: var(--text-on-color);
  }

  .opcao.correta .opcao-letra {
    background: var(--color-success);
    color: var(--text-on-color);
  }

  .opcao.incorreta .opcao-letra {
    background: var(--color-error);
    color: var(--text-on-color);
  }

  .opcao-texto {
    font-size: var(--texto-base);
    line-height: 1.4;
    padding-top: 3px;
  }

  .botao-confirmar {
    width: 100%;
    min-height: var(--alvo-acao);
    background: var(--color-primary);
    color: var(--text-on-color);
    border: none;
    border-radius: var(--raio-botao);
    font-size: var(--texto-base);
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 5px 0 var(--color-primary-shadow);
  }

  .botao-confirmar:not(:disabled):active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 var(--color-primary-shadow);
  }

  .botao-confirmar:disabled {
    opacity: 0.5;
    box-shadow: 0 3px 0 var(--color-primary-shadow);
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
    background: rgba(19, 31, 36, 0.72);
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

  .modal {
    width: 100%;
    max-width: 440px;
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-cards);
    padding: var(--esp-8) var(--esp-6);
    text-align: center;
    box-shadow: 0 12px 0 rgba(0, 0, 0, 0.18), 0 24px 48px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
  }

  /* Acerto: pop elástico com selo de conquista */
  .modal.sucesso {
    border-top: 6px solid var(--color-success);
    animation: sucessoPop 0.5s var(--easing-pop) forwards;
  }

  @keyframes sucessoPop {
    0% { opacity: 0; transform: scale(0.7) translateY(40px); }
    70% { transform: scale(1.04) translateY(-8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Erro: tremor suave não punitivo */
  .modal.erro {
    border-top: 6px solid var(--color-error);
    animation: erroShake 0.45s ease-in-out forwards;
  }

  @keyframes erroShake {
    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
    30% { opacity: 1; transform: scale(1) translateX(-12px); }
    50% { transform: translateX(10px); }
    70% { transform: translateX(-6px); }
    90% { transform: translateX(3px); }
    100% { opacity: 1; transform: scale(1) translateX(0); }
  }

  .modal-icone {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    border-radius: 28px;
    margin-bottom: var(--esp-5);
  }

  .modal.sucesso .modal-icone {
    color: var(--text-on-color);
    background: var(--color-success);
    box-shadow: 0 5px 0 var(--color-success-shadow);
  }

  .modal.erro .modal-icone {
    color: var(--text-on-color);
    background: var(--color-error);
    box-shadow: 0 5px 0 var(--color-error-shadow);
  }

  .modal.sucesso .modal-icone :global(svg) {
    animation: bounceRotate 0.6s var(--easing-pop) 0.1s both;
  }

  .modal.erro .modal-icone :global(svg) {
    animation: dropSway 0.5s var(--easing-suave) 0.1s both;
  }

  .modal-titulo {
    font-size: var(--texto-xl);
    font-weight: 700;
    margin: 0 0 var(--esp-2);
  }

  .modal.sucesso .modal-titulo {
    color: var(--color-success-strong);
  }

  .modal.erro .modal-titulo {
    color: var(--color-error-strong);
  }

  .modal-xp {
    display: inline-block;
    font-size: var(--texto-sm);
    font-weight: 700;
    padding: var(--esp-2) var(--esp-4);
    background: var(--color-secondary);
    color: var(--text-on-color);
    border-radius: var(--raio-pill);
    margin-bottom: var(--esp-4);
    box-shadow: 0 3px 0 var(--color-secondary-shadow);
    animation: xpPop 0.5s ease-out 0.25s both;
  }

  @keyframes xpPop {
    0% { opacity: 0; transform: scale(0.7); }
    70% { transform: scale(1.15); }
    100% { opacity: 1; transform: scale(1); }
  }

  .modal-mensagem {
    font-size: var(--texto-base);
    line-height: 1.6;
    color: var(--text-primary);
    margin-bottom: var(--esp-5);
    text-align: left;
    background: var(--bg-secondary);
    padding: var(--esp-4);
    border-radius: var(--raio-botao);
    border: 1px solid var(--rule);
  }

  .modal-fonte {
    font-size: var(--texto-xs);
    color: var(--text-secondary);
    margin-bottom: var(--esp-6);
    text-align: left;
  }

  .modal-fonte .rotulo {
    display: block;
    margin-bottom: var(--esp-1);
  }

  .modal-acoes {
    display: flex;
    flex-direction: column;
    gap: var(--esp-3);
  }

  .botao-tentar,
  .botao-proxima {
    width: 100%;
    min-height: var(--alvo-acao);
    border: none;
    border-radius: var(--raio-botao);
    font-size: var(--texto-base);
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .botao-tentar {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 2px solid var(--rule);
    box-shadow: 0 4px 0 var(--rule);
  }

  .botao-proxima {
    background: var(--color-success);
    color: var(--text-on-color);
    box-shadow: 0 5px 0 var(--color-success-shadow);
  }

  .botao-tentar:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--rule); }
  .botao-proxima:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--color-success-shadow); }

  .botao-tentar:focus-visible,
  .botao-proxima:focus-visible {
    outline: 3px solid var(--color-primary-strong);
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
    color: var(--color-primary-strong);
    animation: flutuar 1.2s ease-out forwards;
    opacity: 0;
  }

  .p1 { left: 20%; top: 40%; color: var(--color-success); animation-delay: 0.05s; font-size: 28px; }
  .p2 { left: 35%; top: 30%; color: var(--color-secondary); animation-delay: 0.15s; font-size: 22px; }
  .p3 { left: 65%; top: 35%; color: var(--color-primary); animation-delay: 0.1s; font-size: 18px; }
  .p4 { left: 80%; top: 45%; color: var(--color-success); animation-delay: 0.2s; font-size: 26px; }
  .p5 { left: 25%; top: 60%; color: var(--tema-racismo); animation-delay: 0.25s; font-size: 20px; }
  .p6 { left: 75%; top: 65%; color: var(--color-secondary); animation-delay: 0.18s; font-size: 22px; }

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