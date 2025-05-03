import {RepositoryService} from "../lib/repository-service";

export async function load({fetch}) {
	const repositoryService = new RepositoryService(fetch);
	return ({
		filters: await repositoryService.filters(),
		specificationInfo: await repositoryService.specification(),
	});
}
