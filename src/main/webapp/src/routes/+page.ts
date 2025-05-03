import type {PageLoad} from './$types';
import {
	type Filters,
	RepositoryService,
	type RuleSeverity,
	type RuleStatus,
	type RuleType
} from '$lib/repository-service';

export const load: PageLoad = async ({url, fetch}) => {
	const repositoryService = new RepositoryService(fetch);
	const searchParams = url.searchParams;
	const criteria: Filters = {
		search: searchParams.get('search') ?? '',
		language: searchParams.getAll('language'),
		defaultSeverity: searchParams.getAll('defaultSeverity') as RuleSeverity[],
		status: searchParams.getAll('status') as RuleStatus[],
		type: searchParams.getAll('type') as RuleType[],
		tag: searchParams.getAll('tag'),
	};

	const rules = await repositoryService.rules(criteria);

	// Charger les filtres disponibles
	const filters = await repositoryService.filters();

	// Nombre total de règles
	const total = await repositoryService.total();

	return {
		total,
		rules,
		filters,
		criteria,
	};
};
