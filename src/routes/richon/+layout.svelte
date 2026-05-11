<script lang="ts">
	let { children } = $props();
</script>

<div class="richon">
	<nav class="nav">
		<a href="/richon" class="nav-logo">Studio Linse Hoogervorst</a>
		<div class="nav-center">
			<a href="/richon/index">Index</a>
			<a href="/richon/info">Info</a>
		</div>
	</nav>

	{@render children()}

	<footer class="footer">
		<span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}, UTC+2</span>
	</footer>
</div>

<style>
	.richon {
		background: #F5F3F0;
		min-height: 100vh;
		color: #2A2A2A;
	}

	.nav {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 20px 32px;
		font-family: var(--font-serif);
		font-size: 13px;
	}

	.nav-logo {
		font-size: 15px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.nav-center {
		display: flex;
		gap: 24px;
	}

	.nav-center a {
		opacity: 0.5;
		transition: opacity 0.15s;
	}

	.nav-center a:hover {
		opacity: 1;
	}

	.footer {
		padding: 20px 32px;
		font-family: var(--font-serif);
		font-size: 11px;
		color: #999;
		text-align: right;
	}

	@media (max-width: 768px) {
		.nav {
			padding: 16px;
			font-size: 12px;
		}

		.nav-logo {
			font-size: 13px;
		}

		.footer {
			padding: 16px;
		}
	}
</style>
