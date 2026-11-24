<script lang="ts">
  import { routeStore as route } from "./lib/router.svelte";
  import Home from "./routes/Home.svelte";
  import Theme from "./routes/Theme.svelte";
  import Card from "./routes/Card.svelte";
  import Progress from "./routes/Progress.svelte";
  import Help from "./routes/Help.svelte";
  import Panel from "./routes/Panel.svelte";
</script>

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