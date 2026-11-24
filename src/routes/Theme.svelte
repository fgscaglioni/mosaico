<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, selectTheme } from "../lib/store.svelte";
  import { catalog } from "../lib/content";
  import Icon from "../lib/Icon.svelte";

  onMount(async () => {
    await initStore();
  });

  function goTheme(theme: typeof catalog.cards[0]["theme"]) {
    selectTheme(theme);
    navigate("/carta/next");
  }

  function goBack() {
    navigate("/");
  }

  const temas = catalog.cards.filter((c, i, a) => a.findIndex(x => x.theme === c.theme) === i);
</script>

<header class="topo">
  <button class="voltar" onclick={goBack} aria-label="Voltar ao início">
    <Icon name="arrow-left" size={24} />
  </button>
  <h1>Temas</h1>
</header>

<main class="tela-temas">
  <p class="subtitulo">Escolha um tema para começar a praticar</p>

  <div class="grade-temas" aria-label="Temas disponíveis">
    {#each temas as tema}
      {@const dados = store.progress.porTema[tema.theme] || { respostas: 0, acertos: 0, xp: 0 }}
      {@const taxa = dados.respostas > 0 ? Math.round((dados.acertos / dados.respostas) * 100) : 0}
      <button class="tema-card" onclick={() => goTheme(tema.theme)}>
        <span class="tema-cor" style="--tema-cor: var(--tema-{tema.theme})">
          <Icon name={tema.theme} size={28} />
        </span>
        <span class="tema-nome">{tema.theme.charAt(0).toUpperCase() + tema.theme.slice(1)}</span>
        <span class="tema-qtd">5 cartas</span>
        <span class="tema-progresso">{dados.respostas}/5 respondidas · {taxa}% de acertos</span>
      </button>
    {/each}
  </div>
</main>

<style>
  .topo {
    display: flex;
    align-items: center;
    gap: var(--esp-3);
    padding: var(--esp-4);
  }

  .voltar {
    width: var(--alvo-toque);
    height: var(--alvo-toque);
    border: none;
    background: transparent;
    line-height: 0;
    color: var(--ink);
    cursor: pointer;
    border-radius: var(--raio-botao);
  }

  .voltar:hover,
  .voltar:focus-visible {
    background: var(--rule);
  }

  .topo h1 {
    margin: 0;
    flex: 1;
    text-align: center;
  }

  .tela-temas {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--esp-4) var(--esp-6);
  }

  .subtitulo {
    text-align: center;
    opacity: 0.7;
    margin-bottom: var(--esp-5);
  }

  .grade-temas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--esp-3);
  }

  .tema-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--esp-2);
    padding: var(--esp-5) var(--esp-4);
    background: var(--paper);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    min-height: 140px;
    min-width: 0;
    color: var(--ink);
    transition: border-color var(--dur-rapida), transform var(--dur-rapida);
  }

  .tema-card:hover,
  .tema-card:focus-visible {
    border-color: var(--tema-cor);
    transform: translateY(-2px);
  }

  .tema-cor {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--tema-cor);
    color: var(--branco);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tema-nome {
    font-weight: 700;
    font-size: var(--texto-md);
  }

  .tema-qtd {
    font-size: var(--texto-sm);
    opacity: 0.7;
  }

  .tema-progresso {
    font-size: var(--texto-xs);
    font-weight: 700;
    color: var(--tema-cor);
    text-align: center;
  }
</style>