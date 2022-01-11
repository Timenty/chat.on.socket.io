<script lang="ts">
  import Router, { replace } from 'svelte-spa-router';
  import { socketStore } from './storage/socketStore';
  import { user } from './storage/userStore';
  import routes from './routes';

  $: socketConnectedStatus = $socketStore.connected;

  function conditionsFailed() {
    replace('/login');
  }
</script>

<b>{$user.userName || 'username'}</b>
<br>
<span>connected: {socketConnectedStatus}</span>
<br>
<span>isAuthorized: {$user.authorized}</span>

<Router {routes} on:conditionsFailed={conditionsFailed}/>

<style lang="scss">
  :global(body) {
    @import './styles/main.scss';
  }
</style>
