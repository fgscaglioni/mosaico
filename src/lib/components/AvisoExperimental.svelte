<script lang="ts">
  import Icon from "../Icon.svelte";

  interface Props {
    ondismiss?: () => void;
  }

  let { ondismiss }: Props = $props();
</script>

<aside class="aviso-experimental" role="note" aria-label="Aviso de fase experimental">
  <span class="aviso-icone" aria-hidden="true">
    <Icon name="help" size={24} />
  </span>
  <p class="aviso-texto">
    <strong>Versão experimental.</strong>
    Estamos em fase de experimentos, amostragem e validação: as questões ainda
    <strong>não foram avaliadas por uma pessoa</strong>. A revisão humana é um passo
    indispensável antes de este app ficar público ou entrar em produção.
  </p>
  {#if ondismiss}
    <button class="aviso-fechar" onclick={ondismiss} aria-label="Fechar aviso">
      Fechar
    </button>
  {/if}
</aside>

<style>
  .aviso-experimental {
    display: flex;
    align-items: flex-start;
    gap: var(--esp-3);
    max-width: 600px;
    margin: 0 auto var(--esp-4);
    padding: var(--esp-3) var(--esp-4);
    background: var(--bg-secondary);
    border: 2px solid var(--color-secondary);
    border-radius: var(--raio-botao);
    box-shadow: 0 3px 0 var(--color-secondary-shadow);
  }

  .aviso-icone {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--alvo-toque);
    height: var(--alvo-toque);
    flex-shrink: 0;
    border-radius: var(--raio-botao);
    background: var(--color-secondary);
    color: var(--text-on-color);
  }

  .aviso-texto {
    margin: 0;
    flex: 1;
    font-size: var(--texto-sm);
    line-height: 1.5;
    color: var(--text-primary);
  }

  .aviso-fechar {
    flex-shrink: 0;
    min-height: var(--alvo-toque);
    padding: var(--esp-2) var(--esp-3);
    background: transparent;
    border: 2px solid var(--rule);
    border-radius: var(--raio-botao);
    color: var(--text-secondary);
    font-size: var(--texto-sm);
  }

  .aviso-fechar:hover,
  .aviso-fechar:focus-visible {
    border-color: var(--color-secondary-shadow);
    color: var(--text-primary);
  }
</style>
