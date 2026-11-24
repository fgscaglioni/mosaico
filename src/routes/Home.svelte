<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore, selectTheme, getBadgeInfo } from "../lib/store.svelte";
  import { catalog } from "../lib/content";
  import Icon from "../lib/Icon.svelte";

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

  const temas = catalog.cards.filter((c, i, a) => a.findIndex(x => x.theme === c.theme) === i);
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
  </section>

  <nav class="acoes-rodape" aria-label="Ações rápidas">
    <button onclick={goProgress} class="acao-secundaria">Progresso detalhado</button>
    <button onclick={goHelp} class="acao-secundaria">Ajuda</button>
  </nav>
</main>

<style>
  .topo {
    padding: var(--esp-5) var(--esp-4) var(--esp-2);
    text-align: center;
  }

  .topo h1 {
    margin: 0;
  }

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

  .metrica {
    text-align: center;
    padding: var(--esp-4);
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    box-shadow: 0 3px 0 var(--rule);
  }

  .metrica .rotulo {
    display: block;
    font-size: var(--texto-xs);
    margin-bottom: var(--esp-1);
  }

  .metrica .valor {
    display: block;
    font-size: var(--texto-xl);
    font-weight: 700;
    color: var(--color-primary-strong);
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

  .tema-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--esp-3);
    padding: var(--esp-6) var(--esp-5);
    background: var(--bg-secondary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-cards);
    min-height: 160px;
    min-width: 0;
    color: var(--text-primary);
    box-shadow: 0 5px 0 var(--rule);
    transition: border-color var(--dur-rapida), transform var(--dur-rapida), box-shadow var(--dur-rapida);
  }

  .tema-card:hover,
  .tema-card:focus-visible {
    border-color: var(--tema-cor);
    transform: translateY(-3px);
    box-shadow: 0 8px 0 var(--rule);
  }

  .tema-card:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 var(--rule);
  }

  .tema-cor {
    width: 60px;
    height: 60px;
    border-radius: 22px;
    background: var(--tema-cor);
    color: var(--text-on-color);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
  }

  .tema-nome {
    font-weight: 700;
    font-size: var(--texto-md);
    color: var(--text-primary);
  }

  .tema-qtd {
    font-size: var(--texto-sm);
    color: var(--text-secondary);
  }

  .tema-progresso {
    font-size: var(--texto-xs);
    font-weight: 700;
    color: var(--text-secondary);
    text-align: center;
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