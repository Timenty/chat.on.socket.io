<script lang="ts">
	import Router from 'svelte-spa-router';
	import {link} from 'svelte-spa-router';
	import { socket } from './storage/socketStore';
	import { user } from './storage/userStore';

	import routes from './routes';
</script>

<h5>{$user.userName}</h5>
<ul>
    <li><a href="/" use:link>Home</a></li>
    <li><a href="/hello/svelte" use:link>Say hi!</a></li>
    <li><a href="/wild/card" use:link>Wildcard route</a></li>
    <li><a href="/does/not/exist" use:link>Not found</a></li>
</ul>

<Router {routes} />

<style lang="scss">
	:global(body) {
		@import './styles/main.scss';
	}
</style>
