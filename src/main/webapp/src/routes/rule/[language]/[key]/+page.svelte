<script lang="ts">
	import {onMount} from "svelte";
	import {i18n} from "$lib/i18n";

	let lang = "en";
	let {data} = $props();
	let description: string = $state('');

	onMount(async () => {
		try {
			description = await data.ruleInfo.fetchDescription(fetch);
		} catch (error) {
			console.error("Erreur lors du chargement de la description :", error);
		}
	});
</script>

<svelte:head>
	<title>{data.ruleInfo.title} | {data.ruleInfo.language}:{data.ruleInfo.key} |  Creedengo Rules</title>
</svelte:head>

<div class="rule-description">
	<article class="content">
		<h2 class="rule-title">
			<span class="title">{data.ruleInfo.title}</span>
			<span class="ref">
				<img src="/media/icons/language-{data.ruleInfo.language}.svg" alt="" class="icon-language"/>
				<span class="language language-{data.ruleInfo.language}">
					{i18n[lang]?.language[data.ruleInfo.language] ?? data.ruleInfo.language}
				</span> :
				<code class="key">{data.ruleInfo.key}</code>
			</span>
		</h2>
		<div class="attributes">
			<p>
				Default severity:
				<span
					class="defaultSeverity defaultSeverity-{data.ruleInfo.defaultSeverity}">{data.ruleInfo.defaultSeverity}</span>
			</p>
			<ul class="tags">
				{#each data.ruleInfo.tags as tag}
					<li class="tag">{tag}</li>
				{/each}
			</ul>
		</div>

		{@html description}
	</article>
</div>

<style lang="scss">
	.rule-title {
		margin: 1em 0 0;
		font-size: 2rem;
		display: flex;

		.title {
			flex: 1;
		}

		img {
			height: 1em;
			vertical-align: text-top;
		}

		code {
			font-weight: normal;
		}
	}

	.attributes {
		display: flex;
		align-items: center;
		margin: 0.5em 0;
		padding: 0.5em;
		background: #c3e0c3;
		border-radius: 5px;

		p {
			margin: 0;
		}

		.defaultSeverity {
			display: inline-block;
			margin: 0.2em 0;
			padding: 0.2em;
			border: 2px solid #000;
			border-radius: 5px;

			&:before {
				height: 1em;
				width: 1em;
				display: inline-block;
				vertical-align: middle;
				padding-right: 0.2em;
			}

			&.defaultSeverity-Blocker {
				border-color: #b200ff;

				&:before {
					content: url("/media/icons/severity-Blocker.svg");
				}
			}

			&.defaultSeverity-Critical {
				border-color: #ff2b0e;

				&:before {
					content: url("/media/icons/severity-Critical.svg");
				}
			}

			&.defaultSeverity-Major {
				border-color: #ff7700;

				&:before {
					content: url("/media/icons/severity-Major.svg");
				}
			}

			&.defaultSeverity-Minor {
				border-color: #ffcb00;

				&:before {
					content: url("/media/icons/severity-Minor.svg");
				}
			}

			&.defaultSeverity-Info {
				border-color: #3498db;

				&:before {
					content: url("/media/icons/severity-Info.svg");
				}
			}
		}
	}

	.rule-description {
		padding: 0 1em;
	}

	.tags {
		text-align: right;
		list-style: none;
		font-size: 0.8rem;
		margin: 0;
		flex: 1;

		.tag {
			display: inline-block;
			padding: 0 0.3rem;

			&:before {
				content: "🏷️ ";
			}
		}
	}

</style>
