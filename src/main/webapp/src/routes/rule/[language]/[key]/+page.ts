import {error} from '@sveltejs/kit';
import {RepositoryService} from "$lib/repository-service";

export async function load({params, fetch}) {
	const repositoryService = new RepositoryService(fetch);
	return ({
		ruleInfo: await repositoryService
			.ruleForLanguage(
				params.key,
				params.language,
			)
			.catch((e) => {
				console.error("Error loading rule details for key:", params.key, "and language:", params.language, e);
				return error(404);
			}),
	});
}
