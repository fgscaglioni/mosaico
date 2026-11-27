<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import Topo from "../lib/components/Topo.svelte";
  import Metrica from "../lib/components/Metrica.svelte";

  interface Aggregate {
    respostas: number;
    acertos: number;
    xp: number;
    aparelhos: number;
    por_tema: Record<string, { respostas: number; acertos: number; xp: number }>;
  }

  let aggregate = $state<Aggregate>({
    respostas: 0,
    acertos: 0,
    xp: 0,
    aparelhos: 0,
    por_tema: {},
  });
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function loadAggregate() {
    try {
      const response = await fetch("/api/aggregate");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as Aggregate;
      aggregate = data;
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : "Erro ao carregar";
      aggregate = { respostas: 0, acertos: 0, xp: 0, aparelhos: 0, por_tema: {} };
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadAggregate();
  });

  function goBack() {
    navigate("/");
  }
</script>

<Topo titulo="Painel Público" onVoltar={goBack} />

<main class="tela-painel">
  {#if loading}
    <div class="carregando">Carregando dados...</div>
  {:else if error}
    <div class="erro">
      <p>Não foi possível carregar os dados do servidor.</p>
      <p class="erro-detalhe">{error}</p>
      <p>O painel mostra dados agregados dos aparelhos sincronizados.</p>
    </div>
  {:else}
    <section class="resumo-geral">
      <div class="metricas-grid">
        <Metrica rotulo="Total de respostas" valor={aggregate.respostas} />
        <Metrica rotulo="Total de acertos" valor={aggregate.acertos} />
        <Metrica rotulo="XP total" valor={aggregate.xp} />
        <Metrica rotulo="Aparelhos sincronizados" valor={aggregate.aparelhos} />
      </div>
    </section>

    <section class="secao-temas">
      <h2>Desempenho por tema</h2>
      <div class="temas-lista">
        {#each ["bullying", "racismo", "xenofobia", "genero"] as tema}
          {@const dados = aggregate.por_tema[tema] || { respostas: 0, acertos: 0, xp: 0 }}
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

    <section class="nota-privacidade">
      <p>Dados agregados anônimos. Nenhuma informação pessoal é coletada ou exibida.</p>
    </section>
  {/if}
</main>

<style>
  .tela-painel {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .carregando {
    text-align: center;
    padding: 48px 16px;
    font-size: 16px;
  }

  .erro {
    background: var(--bg-secondary);
    border: 2px solid var(--color-error);
    border-radius: var(--raio);
    padding: 24px;
    text-align: center;
    color: var(--color-error-strong);
  }

  .erro-detalhe {
    font-size: 13px;
    opacity: 0.8;
    margin: 8px 0 16px;
  }

  .resumo-geral {
    margin-bottom: 32px;
  }

  .metricas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  h2 {
    font-size: 18px;
    margin: 0 0 16px;
  }

  .secao-temas {
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

  .nota-privacidade {
    text-align: center;
    padding: 16px;
    border-top: 1px solid var(--rule);
    font-size: 13px;
    opacity: 0.7;
    line-height: 1.4;
  }
</style>