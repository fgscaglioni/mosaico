<script lang="ts">
  interface Props {
    rotulo: string;
    valor: string | number;
  }

  let { rotulo, valor }: Props = $props();
</script>

<div class="metrica">
  <span class="rotulo">{rotulo}</span>
  <span class="valor">{valor}</span>
</div>

<style>
  .metrica {
    text-align: center;
    padding: var(--esp-4);
    background: var(--bg-primary);
    border: 2px solid var(--rule);
    border-radius: var(--raio);
    box-shadow: 0 3px 0 var(--rule);
  }

  .rotulo {
    display: block;
    font-size: var(--texto-sm);
    margin-bottom: var(--esp-1);
  }

  .valor {
    display: block;
    font-size: var(--texto-2xl);
    font-weight: 700;
    color: var(--color-primary-strong);
  }
</style>
