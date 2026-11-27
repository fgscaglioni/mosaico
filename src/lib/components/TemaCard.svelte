<script lang="ts">
  import Icon from "../Icon.svelte";
  import { cardsOf, type Card } from "../content";

  interface Props {
    tema: Card["theme"];
    nome: string;
    respostas: number;
    taxa: number;
    onclick: () => void;
  }

  let { tema, nome, respostas, taxa, onclick }: Props = $props();
  const qtd = $derived(cardsOf(tema).length);
</script>

<button class="tema-card" {onclick}>
  <span class="tema-cor" style="--tema-cor: var(--tema-{tema})">
    <Icon name={tema} size={28} />
  </span>
  <span class="tema-nome">{nome}</span>
  <span class="tema-qtd">{qtd} cartas</span>
  <span class="tema-progresso">{respostas}/{qtd} respondidas · {taxa}% de acertos</span>
</button>

<style>
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
    font-size: var(--texto-sm);
    font-weight: 700;
    color: var(--text-secondary);
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .tema-card {
      transition: none;
    }
  }
</style>
