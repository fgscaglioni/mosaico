<script lang="ts">
  import { routeStore as route, navigate } from "./lib/router.svelte";
  import Home from "./routes/Home.svelte";
  import Theme from "./routes/Theme.svelte";
  import Card from "./routes/Card.svelte";
  import Progress from "./routes/Progress.svelte";
  import Help from "./routes/Help.svelte";
  import Panel from "./routes/Panel.svelte";

  function goHelp() {
    navigate("/ajuda");
  }
</script>

<div class="layout">
  <nav class="barra-global" aria-label="Navegação global">
    <a href="#/" class="logo-link">Mosaico</a>
    <div class="links-globais">
      <a href="#/progresso" class="link-nav">Progresso</a>
      <a href="#/ajuda" class="link-ajuda" aria-label="Precisa de ajuda?">Ajuda</a>
    </div>
  </nav>

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
    padding: 12px 16px;
    background: var(--paper);
    border-bottom: 1px solid var(--rule);
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
  }

  .logo-link {
    font-weight: 700;
    font-size: 18px;
    color: var(--ink);
    text-decoration: none;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .links-globais {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .link-nav {
    font-size: 14px;
    color: var(--ink);
    text-decoration: none;
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: 0 8px;
  }

  .link-nav:hover,
  .link-nav:focus-visible {
    color: var(--accent);
  }

  .link-ajuda {
    font-size: 14px;
    font-weight: 600;
    color: var(--paper);
    background: var(--accent);
    padding: 8px 16px;
    border-radius: var(--raio-botao);
    text-decoration: none;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .link-ajuda:hover,
  .link-ajuda:focus-visible {
    opacity: 0.9;
    text-decoration: none;
  }
</style>