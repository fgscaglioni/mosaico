<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, selectTheme } from "../lib/store.svelte";
  import { catalog } from "../lib/content";
  import Topo from "../lib/components/Topo.svelte";
  import TemaCard from "../lib/components/TemaCard.svelte";

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

<Topo titulo="Temas" onVoltar={goBack} />

<main class="tela-temas">
  <p class="subtitulo">Escolha um tema para começar a praticar</p>

  <div class="grade-temas" aria-label="Temas disponíveis">
    {#each temas as tema}
      {@const dados = store.progress.porTema[tema.theme] || { respostas: 0, acertos: 0, xp: 0 }}
      {@const taxa = dados.respostas > 0 ? Math.round((dados.acertos / dados.respostas) * 100) : 0}
      <TemaCard
        tema={tema.theme}
        nome={tema.theme.charAt(0).toUpperCase() + tema.theme.slice(1)}
        respostas={dados.respostas}
        {taxa}
        onclick={() => goTheme(tema.theme)}
      />
    {/each}
  </div>
</main>

<style>
  .tela-temas {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--esp-4) var(--esp-8);
  }

  .subtitulo {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--esp-8);
  }

  .grade-temas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--esp-4);
  }
</style>
