<script lang="ts">
  import Router, { replace } from 'svelte-spa-router';
  import { socket } from './storage/socketStore';
  import { user } from './storage/userStore';

  import routes from './routes';

  function conditionsFailed(event) {
    console.error('conditions failed event', event.detail);
    replace('/login');
  }
</script>

<h5>{$user.userName}</h5>

<Router {routes} on:conditionsFailed={conditionsFailed}/>

<style lang="scss">
  :global(body) {
    @import './styles/main.scss';
  }
</style>
