<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { store, initStore } from "../lib/store.svelte";
  import { getBadgeInfo } from "../lib/store.svelte";
  import { BADGES } from "../lib/domain/badges";
  import Icon from "../lib/Icon.svelte";

  onMount(async () => {
    await initStore();
  });

  function goBack() {
    navigate("/");
  }
</script>

<header class="topo">
  <button class="voltar" onclick={goBack} aria-label="Voltar ao início">
    <Icon name="arrow-left" size={24} />
  </button>
  <h1>Seu Progresso</h1>
</header>

<main class="tela-progresso">
  <section class="resumo-geral">
    <div class="card-nivel">
      <span class="rotulo">Nível atual</span>
      <span class="nivel-numero">{store.progress.level}</span>
      <div class="barra-xp" role="progressbar" aria-valuenow={store.progress.xpInLevel} aria-valuemin={0} aria-valuemax={store.progress.xpInLevel + store.progress.xpToNext}>
        <div class="barra-preenchimento" style="width: {(store.progress.xpInLevel / (store.progress.xpInLevel + store.progress.xpToNext)) * 100}%"></div>
      </div>
      <span class="xp-detalhe">{store.progress.xpInLevel} / {store.progress.xpInLevel + store.progress.xpToNext} XP ({store.progress.xpToNext} para o próximo)</span>
    </div>

    <div class="metricas-grid">
      <div class="metrica">
        <span class="rotulo">Total de XP</span>
        <span class="valor">{store.progress.xp}</span>
      </div>
      <div class="metrica">
        <span class="rotulo">Sequência</span>
        <span class="valor">{store.progress.streak} dias</span>
      </div>
      <div class="metrica">
        <span class="rotulo">Respostas</span>
        <span class="valor">{store.progress.respostas}</span>
      </div>
      <div class="metrica">
        <span class="rotulo">Acertos</span>
        <span class="valor">{store.progress.acertos}</span>
      </div>
    </div>
  </section>

  <section class="secao-temas">
    <h2>Desempenho por tema</h2>
    <div class="temas-lista">
      {#each ["bullying", "racismo", "xenofobia", "genero"] as tema}
        {@const dados = store.progress.porTema[tema] || { respostas: 0, acertos: 0, xp: 0 }}
        {@const taxa = dados.respostas > 0 ? Math.round((dados.acertos / dados.respostas) * 100) : 0}
        <div class="tema-progresso-card">
          <div class="tema-cabecalho">
            <span class="tema-indicador" style="--tema-cor: var(--tema-{tema})"></span>
            <span class="tema-titulo">{tema.charAt(0).toUpperCase() + tema.slice(1)}</span>
            <span class="tema-taxa-texto">{taxa}% de acertos</span>
          </div>
          <div class="tema-barra" role="progressbar" aria-valuenow={taxa} aria-valuemin={0} aria-valuemax={100}>
            <div class="tema-barra-preenchimento" style="width: {taxa}%; --tema-cor: var(--tema-{tema})"></div>
          </div>
          <div class="tema-submetricas">
            <span>{dados.respostas} respondidas</span>
            <span>{dados.acertos} corretas</span>
            <span>+{dados.xp} XP</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="secao-medalhas">
    <h2>Medalhas conquistadas ({store.progress.badges.length}/{BADGES.length})</h2>
    <div class="grade-medalhas">
      {#each BADGES as badge}
        {@const conquistada = store.progress.badges.includes(badge.id)}
        <div class="badge-card" class:conquistada>
          <span class="badge-icone">
            <Icon name="star" size={28} />
          </span>
          <span class="badge-nome">{badge.label}</span>
          <span class="badge-desc">{badge.description}</span>
          <span class="sr-only">{conquistada ? "Conquistada" : "Não conquistada"}</span>
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  .topo {
    display: flex;
    align-items: center;
    gap: 12px;
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

  .topo h1 {
    margin: 0;
    font-size: 22px;
    flex: 1;
    text-align: center;
  }

  .tela-progresso {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .card-nivel {
    background: var(--text-primary);
    color: var(--bg-primary);
    border-radius: var(--raio);
    padding: 24px;
    text-align: center;
    margin-bottom: 16px;
  }

  .nivel-numero {
    display: block;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.1;
    margin: 8px 0 16px;
  }

  .barra-xp {
    height: 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .barra-preenchimento {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s;
  }

  .xp-detalhe {
    font-size: 13px;
    opacity: 0.8;
  }

  .metricas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }

  .metrica {
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-botao);
    padding: 16px;
    text-align: center;
  }

  .metrica .valor {
    display: block;
    font-size: 24px;
    font-weight: 700;
    margin-top: 4px;
  }

  h2 {
    font-size: 18px;
    margin: 0 0 16px;
  }

  .secao-temas,
  .secao-medalhas {
    margin-bottom: 32px;
  }

  .temas-lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tema-progresso-card {
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-botao);
    padding: 16px;
  }

  .tema-cabecalho {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .tema-indicador {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--tema-cor);
  }

  .tema-titulo {
    font-weight: 600;
    flex: 1;
  }

  .tema-taxa-texto {
    font-size: 14px;
    font-weight: 700;
  }

  .tema-barra {
    height: 8px;
    background: var(--rule);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .tema-barra-preenchimento {
    height: 100%;
    background: var(--tema-cor);
    transition: width 0.3s;
  }

  .tema-submetricas {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    opacity: 0.7;
  }

  .grade-medalhas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .badge-card {
    background: var(--bg-primary);
    border: 2px dashed var(--rule);
    border-radius: var(--raio-botao);
    padding: 16px;
    text-align: center;
    opacity: 0.5;
  }

  .badge-card.conquistada {
    border-style: solid;
    border-color: var(--color-primary);
    opacity: 1;
    background: rgba(166, 61, 0, 0.05);
  }

  .badge-icone {
    font-size: 24px;
    display: block;
    margin-bottom: 4px;
    color: var(--color-primary);
  }

  .badge-nome {
    display: block;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .badge-desc {
    display: block;
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.3;
  }
</style>