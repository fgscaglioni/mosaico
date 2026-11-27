<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, selectTheme, getBadgeInfo } from "../lib/store.svelte";
  import type { BadgeId } from "../lib/domain/badges";
  import { catalog } from "../lib/content";
  import Topo from "../lib/components/Topo.svelte";
  import Metrica from "../lib/components/Metrica.svelte";
  import TemaCard from "../lib/components/TemaCard.svelte";

  onMount(async () => {
    await initStore();
  });

  function goTheme(theme: typeof catalog.cards[0]["theme"]) {
    selectTheme(theme);
    navigate("/carta/next");
  }

  function goProgress() {
    navigate("/progresso");
  }

  function goHelp() {
    navigate("/ajuda");
  }

  function badgeLabel(id: BadgeId) {
    return getBadgeInfo(id)?.label ?? id;
  }

  const temas = catalog.cards.filter((c, i, a) => a.findIndex(x => x.theme === c.theme) === i);
</script>

<Topo titulo="Mosaico" centrado />

<main class="inicio">
  <section class="progresso-resumo" aria-label="Resumo do progresso">
    <div class="metricas">
      <Metrica rotulo="Nível" valor={store.progress.level} />
      <Metrica rotulo="XP" valor={store.progress.xp} />
      <Metrica rotulo="Sequência" valor={`${store.progress.streak} dias`} />
      <Metrica rotulo="Medalhas" valor={`${store.progress.badges.length} / 6`} />
    </div>

    {#if store.progress.badges.length > 0}
      <div class="medalhas" aria-label="Medalhas conquistadas">
        {#each store.progress.badges as id}
          <span class="medalha" title={getBadgeInfo(id)?.description ?? ""}>
            {badgeLabel(id)}
          </span>
        {/each}
      </div>
    {/if}
  </section>

  <section class="temas" aria-label="Temas disponíveis">
    <h2>Escolha um tema</h2>
    <div class="grade-temas">
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
  </section>

  <nav class="acoes-rodape" aria-label="Ações rápidas">
    <button onclick={goProgress} class="acao-secundaria">Progresso detalhado</button>
    <button onclick={goHelp} class="acao-secundaria">Ajuda</button>
  </nav>
</main>

<style>
  .inicio {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--esp-4) var(--esp-6);
  }

  .progresso-resumo {
    background: var(--bg-secondary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-cards);
    padding: var(--esp-5);
    margin-bottom: var(--esp-8);
  }

  .metricas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--esp-3);
    margin-bottom: var(--esp-3);
  }

  .medalhas {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-2);
    justify-content: center;
  }

  .medalha {
    font-size: var(--texto-xs);
    font-weight: 700;
    padding: var(--esp-2) var(--esp-4);
    background: var(--color-secondary);
    color: var(--text-on-color);
    border-radius: var(--raio-pill);
    white-space: nowrap;
    box-shadow: 0 3px 0 var(--color-secondary-shadow);
  }

  .temas h2 {
    margin-bottom: var(--esp-6);
    text-align: center;
  }

  .grade-temas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--esp-4);
    margin-bottom: var(--esp-8);
  }

  .acoes-rodape {
    display: flex;
    gap: var(--esp-3);
    justify-content: center;
  }

  .acao-secundaria {
    min-height: var(--alvo-toque);
    padding: var(--esp-3) var(--esp-5);
    background: var(--bg-secondary);
    border: 2px solid var(--rule);
    color: var(--text-primary);
    border-radius: var(--raio-botao);
    font-size: var(--texto-sm);
    font-weight: 700;
    box-shadow: 0 4px 0 var(--rule);
  }

  .acao-secundaria:hover, .acao-secundaria:focus-visible {
    border-color: var(--color-primary-strong);
  }

  .acao-secundaria:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 var(--rule);
  }
</style>
