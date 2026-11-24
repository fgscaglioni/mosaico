<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, selectTheme, getBadgeInfo } from "../lib/store.svelte";
  import { catalog } from "../lib/content";

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

  function badgeLabel(id: string) {
    return getBadgeInfo(id as any)?.label ?? id;
  }
</script>

<header class="topo">
  <h1>Mosaico</h1>
</header>

<main class="inicio">
  <section class="progresso-resumo" aria-label="Resumo do progresso">
    <div class="metricas">
      <div class="metrica">
        <span class="rotulo">Nível</span>
        <span class="valor">{store.progress.level}</span>
      </div>
      <div class="metrica">
        <span class="rotulo">XP</span>
        <span class="valor">{store.progress.xp}</span>
      </div>
      <div class="metrica">
        <span class="rotulo">Sequência</span>
        <span class="valor">{store.progress.streak} dias</span>
      </div>
      <div class="metrica">
        <span class="rotulo">Medalhas</span>
        <span class="valor">{store.progress.badges.length} / 6</span>
      </div>
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
      {#each catalog.cards.filter((c, i, a) => a.findIndex(x => x.theme === c.theme) === i) as tema}
        <button class="tema-card" onclick={() => goTheme(tema.theme)}>
          <span class="tema-cor" style="--tema-cor: var(--tema-{tema.theme})"></span>
          <span class="tema-nome">{tema.theme.charAt(0).toUpperCase() + tema.theme.slice(1)}</span>
          <span class="tema-qtd">5 cartas</span>
        </button>
      {/each}
    </div>
  </section>

  <nav class="acoes-rodape" aria-label="Ações rápidas">
    <button onclick={goProgress} class="acao-secundaria">Progresso detalhado</button>
    <button onclick={goHelp} class="acao-secundaria">Ajuda</button>
  </nav>
</main>

<style>
  .topo {
    padding: 24px 16px 8px;
    text-align: center;
  }

  .topo h1 {
    margin: 0;
    font-size: 30px;
  }

  .inicio {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .progresso-resumo {
    background: var(--paper);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    padding: 16px;
    margin-bottom: 24px;
  }

  .metricas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  .metrica {
    text-align: center;
    padding: 12px;
    background: var(--ink);
    color: var(--paper);
    border-radius: var(--raio-botao);
  }

  .metrica .rotulo {
    display: block;
    font-size: 11px;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .metrica .valor {
    font-size: 22px;
    font-weight: 700;
  }

  .medalhas {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .medalha {
    font-size: 12px;
    padding: 6px 12px;
    background: var(--accent);
    color: var(--paper);
    border-radius: 999px;
    white-space: nowrap;
  }

  .temas h2 {
    margin-bottom: 16px;
    text-align: center;
  }

  .grade-temas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
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

  .acoes-rodape {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .acao-secundaria {
    min-height: 44px;
    padding: 10px 20px;
    background: transparent;
    border: 2px solid var(--rule);
    color: var(--ink);
    border-radius: var(--raio-botao);
    font-size: 14px;
    font-weight: 500;
  }

  .acao-secundaria:hover,
  .acao-secundaria:focus-visible {
    border-color: var(--accent);
    background: var(--ink);
    color: var(--paper);
  }
</style>