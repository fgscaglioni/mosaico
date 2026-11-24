<script lang="ts">
  type IconName =
    | "check"
    | "x"
    | "star"
    | "arrow-left"
    | "help"
    | "phone"
    | "coins"
    | "bullying"
    | "racismo"
    | "xenofobia"
    | "genero";

  interface Props {
    name: IconName;
    size?: number;
    label?: string;
    decorativo?: boolean;
  }

  let { name, size = 24, label = "", decorativo = true }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden={decorativo ? "true" : undefined}
  role={decorativo ? undefined : "img"}
  aria-label={decorativo ? undefined : label}
>
  {#if name === "check"}
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 2.5 2.5L16 9" />
  {:else if name === "x"}
    <circle cx="12" cy="12" r="10" />
    <path d="m9 9 6 6M15 9l-6 6" />
  {:else if name === "star"}
    <path d="m12 2 3 6.3 6.9 1-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-1L12 2Z" />
  {:else if name === "arrow-left"}
    <path d="M19 12H5M12 19l-7-7 7-7" />
  {:else if name === "help"}
    <circle cx="12" cy="12" r="10" />
    <path d="M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" />
    <path d="M12 17h.01" />
  {:else if name === "phone"}
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2.1L9.1 10.9a16 16 0 0 0 6 6l1.5-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z" />
  {:else if name === "coins"}
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v5c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
    <path d="M4 11v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
  {:else if name === "bullying"}
    <circle cx="12" cy="12" r="8" />
  {:else if name === "racismo"}
    <path d="M12 3 21 12 12 21 3 12Z" />
  {:else if name === "xenofobia"}
    <path d="M12 3 22 20H2Z" />
  {:else if name === "genero"}
    <rect x="4" y="4" width="16" height="16" rx="4" />
  {/if}
</svg>
