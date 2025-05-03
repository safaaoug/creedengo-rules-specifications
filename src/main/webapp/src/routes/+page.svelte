<script lang="ts">
	import {i18n} from "$lib/i18n";
	import type {Filters, RuleSeverity, RuleStatus, RuleType} from '$lib/repository-service';
	import {RepositoryService} from '$lib/repository-service';

	export let lang = 'en';

	export let data: {
		total: number;
		criteria: Filters;
		filters: Filters;
		rules: any[];
	};

	// Initialisation de la liste des règles
	let rules = data.rules;

	// La déclaration réactive met à jour les règles dès que data.criteria change
	$: (async () => {
		const repositoryService = new RepositoryService(fetch);
		// on utilise RepositoryService.rules en lui passant les critères mis à jour
		rules = await repositoryService.rules(data.criteria);
		// Au chargement initial, `document` n'est pas défini, donc on ne peut pas mettre à jour l'URL
		if (typeof document !== 'undefined') {
			updateUrlFromFilter(buildFilterFromForm());
		}
	})();

	// Construit l'objet Filters à partir du formulaire
	function buildFilterFromForm(): Filters {
		const formData = new FormData(document.querySelector('form') ?? undefined);
		return {
			search: formData.get('search')?.toString() || '',
			language: formData.getAll('language') as string[],
			tag: formData.getAll('tag') as string[],
			type: formData.getAll('type') as RuleType[],
			defaultSeverity: formData.getAll('defaultSeverity') as RuleSeverity[],
			status: formData.getAll('status') as RuleStatus[]
		};
	}

	// Met à jour l'URL en utilisant window.history.pushState sans recharger la page
	function updateUrlFromFilter(filters: Filters) {
		const params = new URLSearchParams();
		if (filters.search) {
			params.set('search', filters.search);
		}
		filters.language.forEach(value => params.append('language', value));
		filters.defaultSeverity.forEach(value => params.append('defaultSeverity', value));
		filters.status.forEach(value => params.append('status', value));
		filters.tag.forEach(value => params.append('tag', value));
		filters.type.forEach(value => params.append('type', value));
		const quaryParamsStr = params.toString();
		window.history.pushState({}, '', window.location.pathname + (quaryParamsStr.length === 0 ? '' : `?${quaryParamsStr}`));
	}
</script>

<svelte:head>
	<title>Index |  Creedengo Rules</title>
</svelte:head>

<aside>
	<form>
		{#if rules.length === data.total}
			<p>{data.total} rules</p>
		{:else}
			<p>{rules.length} filtered rule{rules.length === 1 ? '' : 's'} over {data.total}</p>
		{/if}
		<h2>Filters</h2>
		<p>
			<input type="search" bind:value={data.criteria.search} name="search" placeholder="Search"/>
		</p>
		<details class="filter" open>
			<summary>by language</summary>
			<ul>
				{#each data.filters.language as language}
					<li>
						<label>
							<input
								type="checkbox"
								name="language"
								bind:group={data.criteria.language}
								value={language}
							/>
							<span class="language language-{language}">
								<img src="/media/icons/language-{language}.svg" alt="" class="icon-language"/>
								{i18n[lang]?.language[language] ?? language}
							</span>
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<details class="filter" open>
			<summary>by severity</summary>
			<ul>
				{#each data.filters.defaultSeverity as defaultSeverity}
					<li>
						<label>
							<input
								type="checkbox"
								name="defaultSeverity"
								value={defaultSeverity}
								bind:group={data.criteria.defaultSeverity}
							/>
							<span
								class="defaultSeverity defaultSeverity-{defaultSeverity}">{i18n[lang]?.defaultSeverity[defaultSeverity] ?? defaultSeverity}</span>
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<details class="filter" open>
			<summary>by status</summary>
			<ul>
				{#each data.filters.status as status}
					<li>
						<label>
							<input
								type="checkbox"
								name="status"
								value={status}
								bind:group={data.criteria.status}
							/>
							<span class="status status-{status}">{i18n[lang]?.status[status] ?? status}</span>
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<details class="filter types" open>
			<summary>by type</summary>
			<ul>
				{#each data.filters.type as type}
					<li>
						<label>
							<input
								type="checkbox"
								name="type"
								value={type}
								bind:group={data.criteria.type}
							/>
							<span class="type type-{type}">{i18n[lang]?.type[type] ?? type}</span>
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<details class="filter tags" open>
			<summary>by tag</summary>
			<ul>
				{#each data.filters.tag as tag}
					<li>
						<label>
							<input
								type="checkbox"
								name="tag"
								value={tag}
								bind:group={data.criteria.tag}
							/>
							<span class="tag">{tag}</span>
						</label>
					</li>
				{/each}
			</ul>
		</details>
		<p>
			<button type="reset">Reset</button>
		</p>
	</form>
</aside>
<section class="rules">
	{#each rules as rule}
		<a href="/rule/{rule.language}/{rule.key}" class="rule{rule.status==='deprecated' ? ' deprecated' : ''}">
			<h2>
				<span class="title">{rule.title}</span>
				<code class="ref">
					<span class="language language-{rule.language}">{rule.language}</span>:<span
					class="key">{rule.key}</span>
				</code>
			</h2>
			<div class="attributes">
				<p class="defaultSeverity defaultSeverity-{rule.defaultSeverity}">{rule.defaultSeverity}</p>
				<ul class="tags">
					{#each rule.tags as tag}
						<li class="tag">{tag}</li>
					{/each}
				</ul>
			</div>
		</a>
	{/each}
</section>

<style lang="scss">
	aside {
		border-right: 1px solid #c3e0c3;
		padding: 0.5em;

		h2 {
			font-size: 1.2em;
			margin: 0;
		}

		.filter {
			margin: 0.5em 0;

			summary {
				font-size: 1em;
				margin: 0;
				font-weight: normal;
				border-bottom: 1px solid #c3e0c3;
			}

			ul {
				list-style: none;
				padding: 0;
				margin: .5em 0 0 0;

				label {
					cursor: pointer;

					span {
						vertical-align: middle;
					}
				}
			}
		}
	}

	.rules {
		padding: 0.5em;
		flex: 1;
	}

	.rule {
		display: block;
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 5px;
		margin: 1rem 0;
		text-decoration: none;
		color: inherit;

		&:hover,
		&:focus {
			background-color: #f0f0f0;
			box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
		}

		&.deprecated h2 .title {
			text-decoration: line-through;
			font-style: italic;
			color: #595959;
		}

		h2 {
			margin: 0;
			display: flex;
			align-items: center;

			.title {
				flex: 1;
			}

			.ref {
				font-weight: normal;
				font-size: 0.8rem;
				border: 1px solid #ccc;
				padding: 0.2rem;
				border-radius: 5px;
			}
		}

		.attributes {
			display: flex;
			align-items: center;
		}

		.tags {
			text-align: right;
			list-style: none;
			font-size: 0.8rem;
			margin: 0;
			flex: 1;

			li {
				display: inline-block;
				padding: 0 0.3rem;
			}
		}
	}

	.tag:before {
		content: "🏷️ ";
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

</style>
