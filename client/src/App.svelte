<script lang="ts">
	import Router from 'svelte-spa-router';
	import {link} from 'svelte-spa-router';

	import routes from './routes';
</script>

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
