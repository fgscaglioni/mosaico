<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { initStore, selectTheme } from "../lib/store.svelte";
  import { catalog } from "../lib/content";

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
</script>

<header class="topo">
  <button class="voltar" onclick={goBack} aria-label="Voltar ao início">←</button>
  <h1>Temas</h1>
</header>

<main class="tela-temas">
  <p class="subtitulo">Escolha um tema para começar a praticar</p>

  <div class="grade-temas" aria-label="Temas disponíveis">
    {#each catalog.cards.filter((c, i, a) => a.findIndex(x => x.theme === c.theme) === i) as tema}
      <button class="tema-card" onclick={() => goTheme(tema.theme)}>
        <span class="tema-cor" style="--tema-cor: var(--tema-{tema.theme})"></span>
        <span class="tema-nome">{tema.theme.charAt(0).toUpperCase() + tema.theme.slice(1)}</span>
        <span class="tema-qtd">5 cartas</span>
      </button>
    {/each}
  </div>
</main>

<style>
  .topo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }

  .voltar {
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    font-size: 24px;
    line-height: 1;
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
    font-size: 22px;
    flex: 1;
    text-align: center;
  }

  .tela-temas {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .subtitulo {
    text-align: center;
    opacity: 0.7;
    margin-bottom: 24px;
  }

  .grade-temas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .tema-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 16px;
    background: var(--paper);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    min-height: 120px;
    min-width: 0;
    transition: border-color 0.15s, transform 0.15s;
  }

  .tema-card:hover,
  .tema-card:focus-visible {
    border-color: var(--tema-cor);
    transform: translateY(-2px);
  }

  .tema-cor {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--tema-cor);
  }

  .tema-nome {
    font-weight: 600;
    font-size: 16px;
  }

  .tema-qtd {
    font-size: 13px;
    opacity: 0.7;
  }
</style>