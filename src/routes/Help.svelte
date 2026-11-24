<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../lib/router.svelte";
  import { initStore, recordHelpOpen } from "../lib/store.svelte";
  import { helpContent } from "../lib/content";
  import Icon from "../lib/Icon.svelte";

  onMount(async () => {
    await initStore();
    await recordHelpOpen();
  });

  function goBack() {
    navigate("/");
  }
</script>

<header class="topo">
  <button class="voltar" onclick={goBack} aria-label="Voltar ao início">
    <Icon name="arrow-left" size={24} />
  </button>
  <h1>Canais de Ajuda</h1>
</header>

<main class="tela-ajuda">
  <section class="dica-adulto" aria-label="Orientação principal">
    <div class="dica-icone"><Icon name="help" size={40} /></div>
    <p class="dica-texto">{helpContent.adult_tip}</p>
  </section>

  <section class="lista-canais" aria-label="Canais de atendimento">
    <h2>Canais oficiais e gratuitos</h2>
    <div class="canais-grid">
      {#each helpContent.channels as channel}
        <div class="canal-card">
          <div class="canal-info">
            <span class="canal-nome">{channel.name}</span>
            <span class="canal-what">{channel.what}</span>
          </div>
          {#if channel.number}
            <a href="tel:{channel.number}" class="canal-numero" aria-label="Ligar para {channel.name} no número {channel.number}">
              <Icon name="phone" size={18} />
              <span>{channel.number}</span>
            </a>
          {:else}
            <span class="canal-sem-numero">Procure na sua cidade</span>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section class="aviso-seguranca" aria-label="Informações importantes">
    <p>O Mosaico não armazena relatos, não envia mensagens e não substitui os canais oficiais de acolhimento.</p>
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

  .tela-ajuda {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px 32px;
  }

  .dica-adulto {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 20px;
    border-radius: var(--raio);
    margin-bottom: 24px;
  }

  .dica-icone {
    font-size: 32px;
    flex-shrink: 0;
  }

  .dica-texto {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
  }

  .lista-canais h2 {
    font-size: 18px;
    margin: 0 0 16px;
  }

  .canais-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .canal-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio-botao);
    padding: 16px;
  }

  .canal-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .canal-nome {
    font-size: 16px;
    font-weight: 700;
  }

  .canal-what {
    font-size: 13px;
    opacity: 0.8;
    line-height: 1.3;
  }

  .canal-numero {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 16px;
    background: var(--color-primary);
    color: var(--bg-primary);
    border-radius: var(--raio-botao);
    font-weight: 700;
    font-size: 18px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .canal-numero:hover,
  .canal-numero:focus-visible {
    opacity: 0.9;
    text-decoration: none;
  }

  .canal-sem-numero {
    font-size: 12px;
    font-weight: 600;
    padding: 8px 12px;
    background: var(--rule);
    border-radius: var(--raio-botao);
    color: var(--text-primary);
    text-align: center;
  }

  .aviso-seguranca {
    text-align: center;
    padding: 16px;
    border-top: 1px solid var(--rule);
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.4;
  }

  .aviso-seguranca p {
    margin: 0;
  }
</style>