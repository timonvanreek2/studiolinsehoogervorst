<footer class="footer">
	<div class="footer-content">
		<div class="col-text">
			<p>Panamalaan 2D</p>
			<p>1019AZ Amsterdam</p>
		</div>

		<div class="col-text">
			<p><a href="mailto:info@studiolinsehoogervorst.com">info@studiolinsehoogervorst.com</a></p>
			<p>Tel: <a href="tel:+31206754798">+31(0)20 675 47 98</a></p>
		</div>
	</div>
</footer>

<style>
	.footer {
		min-height: 35vh;
		padding: 8px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		font-family: var(--font-sans);
		font-weight: 450;
		font-size: 12px;
		line-height: 16px;
		color: #000;
		box-sizing: border-box;
	}

	/* Two text blocks, grouped at the bottom-left. They stay their natural
	   width (no flex-grow) so they sit together on the left rather than
	   spreading across the row; they wrap to two rows if a narrow screen
	   can't fit them side by side. */
	.footer-content {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 64px;
		align-items: flex-end;
	}

	.col-text {
		flex: 0 0 auto;
	}

	.col-text p {
		margin: 0;
	}

	.col-text a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.col-text a:hover {
		opacity: 0.5;
	}

	@media (max-width: 768px) {
		.footer {
			min-height: auto;
		}

		.footer-content {
			gap: 16px 32px;
		}
	}
</style>
