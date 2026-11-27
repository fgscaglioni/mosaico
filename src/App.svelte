<script lang="ts">
  import { onMount } from "svelte";
  import { routeStore as route, navigate } from "./lib/router.svelte";
  import { startAutoSync, stopAutoSync, triggerSyncOnOnline } from "./lib/sync";
  import Icon from "./lib/Icon.svelte";
  import Home from "./routes/Home.svelte";
  import Theme from "./routes/Theme.svelte";
  import Card from "./routes/Card.svelte";
  import Progress from "./routes/Progress.svelte";
  import Help from "./routes/Help.svelte";
  import Panel from "./routes/Panel.svelte";
  import AvisoExperimental from "./lib/components/AvisoExperimental.svelte";

  let dark = $state(false);
  // O aviso volta a cada carregamento: é um aviso de fase, não uma preferência.
  let avisoVisivel = $state(true);

  onMount(() => {
    dark = document.documentElement.getAttribute("data-theme") === "dark";
    startAutoSync();
    triggerSyncOnOnline();
    return () => {
      stopAutoSync();
    };
  });

  function toggleTheme() {
    dark = !dark;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("mosaico-theme", dark ? "dark" : "light");
    } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#131F24" : "#00A8E8");
  }
</script>

<div class="layout">
  <nav class="barra-global" aria-label="Navegação global">
    <a href="#/" class="logo-link">Mosaico</a>
    <div class="links-globais">
      <a href="#/progresso" class="link-nav">Progresso</a>
      <button
        class="tema-toggle"
        onclick={toggleTheme}
        aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
        aria-pressed={dark}
        title={dark ? "Tema claro" : "Tema escuro"}
      >
        {dark ? "☀" : "☾"}
      </button>
      <a href="#/ajuda" class="link-ajuda">Ajuda</a>
    </div>
  </nav>

  {#if avisoVisivel}
    <div class="aviso-faixa">
      <AvisoExperimental ondismiss={() => (avisoVisivel = false)} />
    </div>
  {/if}

  <main>
    {#if $route.path === "/"}
      <Home />
    {:else if $route.path === "/tema"}
      <Theme />
    {:else if $route.path.startsWith("/carta/")}
      <Card />
    {:else if $route.path === "/progresso"}
      <Progress />
    {:else if $route.path === "/ajuda"}
      <Help />
    {:else if $route.path === "/painel"}
      <Panel />
    {:else}
      <Home />
    {/if}
  </main>
</div>

<style>
  .layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .barra-global {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--esp-3) var(--esp-4);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--rule);
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
  }

  .logo-link {
    font-family: var(--fonte-titulo);
    font-weight: 700;
    font-size: var(--texto-base);
    color: var(--text-primary);
    text-decoration: none;
    min-height: var(--alvo-toque);
    display: flex;
    align-items: center;
  }

  .links-globais {
    display: flex;
    align-items: center;
    gap: var(--esp-2);
  }

  .link-nav {
    font-size: var(--texto-sm);
    color: var(--text-primary);
    text-decoration: none;
    min-height: var(--alvo-toque);
    display: flex;
    align-items: center;
    padding: 0 var(--esp-2);
  }

  .link-nav:hover, .link-nav:focus-visible { color: var(--color-primary-strong); }

  .tema-toggle {
    width: var(--alvo-toque);
    height: var(--alvo-toque);
    min-height: var(--alvo-toque);
    border-radius: var(--raio-botao);
    border: 2px solid var(--rule);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: var(--texto-md);
    line-height: 1;
    box-shadow: 0 3px 0 var(--rule);
    padding: 0;
  }

  .tema-toggle:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--rule);
  }

  .link-ajuda {
    font-size: var(--texto-sm);
    font-weight: 700;
    color: var(--text-on-color);
    background: var(--color-secondary);
    padding: var(--esp-2) var(--esp-4);
    border-radius: var(--raio-botao);
    text-decoration: none;
    min-height: var(--alvo-toque);
    display: flex;
    align-items: center;
    box-shadow: 0 4px 0 var(--color-secondary-shadow);
  }

  .link-ajuda:hover, .link-ajuda:focus-visible { opacity: 0.92; text-decoration: none; }
  .link-ajuda:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--color-secondary-shadow); }

  .aviso-faixa {
    padding: var(--esp-3) var(--esp-4) 0;
  }
</style>