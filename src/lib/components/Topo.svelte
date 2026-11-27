<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon from "../Icon.svelte";

  interface Props {
    titulo?: string;
    onVoltar?: () => void;
    voltarLabel?: string;
    centrado?: boolean;
    espacado?: boolean;
    children?: Snippet;
  }

  let {
    titulo = "",
    onVoltar,
    voltarLabel = "Voltar ao início",
    centrado = false,
    espacado = false,
    children,
  }: Props = $props();
</script>

<header class="topo" class:topo-centrado={centrado} class:topo-espacado={espacado}>
  {#if onVoltar}
    <span class="voltar-espaco">
      <button class="voltar" onclick={onVoltar} aria-label={voltarLabel}>
        <Icon name="arrow-left" size={24} />
      </button>
    </span>
  {/if}
  {#if titulo}
    <h1>{titulo}</h1>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</header>

<style>
  .topo {
    display: flex;
    align-items: center;
    gap: var(--esp-3);
    padding: var(--esp-4);
    max-width: 600px;
    margin: 0 auto;
  }

  .topo-espacado {
    justify-content: space-between;
  }

  .topo-centrado {
    display: block;
    text-align: center;
    padding: var(--esp-5) var(--esp-4) var(--esp-2);
  }

  .topo h1 {
    margin: 0;
    flex: 1;
    text-align: center;
  }

  .topo-centrado h1 {
    margin: 0;
  }

  .voltar-espaco {
    display: flex;
    min-width: var(--alvo-toque);
  }

  .voltar {
    width: var(--alvo-toque);
    height: var(--alvo-toque);
    border: none;
    background: transparent;
    line-height: 0;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: var(--raio-botao);
  }

  .voltar:hover,
  .voltar:focus-visible {
    background: var(--rule);
  }
</style>
