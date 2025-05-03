export class RepositoryService {
    /**
     * The language used to display the rules.
     */
    private lang: string = "en";

    /**
     * The minimum length of the search term.
     * @private
     */
    private minTermLength: number = 4;

    private readonly _repository: Promise<Repository>;
    private readonly _rules: Promise<RuleInfo[]>;
    private readonly _specification: Promise<RepositorySpecification>;
    private readonly _filters: Promise<Filters>;

    constructor(private readonly fetch: typeof globalThis.fetch) {
        this._repository = this.fetch('/index.json')
            .then((response) => response.json());
        this._rules = this._repository.then(repository => Object
            .values(repository.rules)
            .flatMap((rulesByLanguage) => Object.values(rulesByLanguage))
            .map((rule) => new RuleInfo(rule, this.lang))
            .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
        );
        this._specification = this._repository.then(repository => repository.specification);
        this._filters = this._rules
            .then((rules) => ({
                term: [],
                language: [...new Set(rules.map((rule) => rule.language))],
                defaultSeverity: [...new Set(rules.map((rule) => rule.defaultSeverity).sort(SORT_SEVERITY))],
                status: [...new Set(rules.map((rule) => rule.status))],
                type: [...new Set(rules.map((rule) => rule.type))],
                tag: [...new Set(rules.flatMap((rule) => rule.tags).sort(SORT_STRINGS))],
            }));
    }

    public total(): Promise<number> {
        return this._rules.then(rules => rules.length);
    }

    public rules(filter?: Filters): Promise<RuleInfo[]> {
        const {search = '', language = [], defaultSeverity = [], status = [], tag = [], type = []} = filter || {};
        const terms = this.normalizeTerms(search);
        return this._rules.then(rules => rules.filter(rule =>
            this.matchAllIncludesItems(rule.localizedTerms, terms) &&
            this.matchItem(rule.language, language) &&
            this.matchItem(rule.defaultSeverity, defaultSeverity) &&
            this.matchItem(rule.status, status) &&
            this.matchItem(rule.type, type) &&
            this.matchAnyItems(rule.tags, tag)
        ));
    }

    public matchItem<T>(ruleItem: T, filerItems: T[]): boolean {
        if (filerItems.length === 0) {
            return true;
        }
        return filerItems.includes(ruleItem);
    }

    public matchAllIncludesItems(ruleItems: string[], filerItems: string[]): boolean {
        if (filerItems.length === 0) {
            return true;
        }
        return filerItems.every(filerItem => {
            return ruleItems.some(ruleItem => {
                return ruleItem.includes(filerItem);
            });
        });
    }

    public matchAnyItems<T>(ruleItems: T[], filerItems: T[]): boolean {
        if (filerItems.length === 0) {
            return true;
        }
        return filerItems.some(filerItem => {
            return ruleItems.includes(filerItem);
        });
    }

    /**
     * Normalize a string by removing diacritics and ligatures.
     * @param raw
     */
    private normalizeTerms(raw ?: string | null): string[] {
        if (!raw) {
            return [];
        }
        return raw
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036F]/g, "")
            .split(/\s+/)
            .flatMap(term => {
                const result = [term];
                // Check if term is numeric
                if (!isNaN(Number(term))) {
                    // Add terms for rule key if term is numeric
                    result.push("gci" + term);
                }
                return result;
            })
            .filter(term => term.length >= this.minTermLength);
    }

    public filters(): Promise<Filters> {
        return this._filters;
    }

    public specification(): Promise<RepositorySpecification> {
        return this._specification;
    }

    public setLang(lang: string): void {
        this.lang = lang;
    }

    public ruleForLanguage(key: string, language: string): Promise<RuleInfo> {
        return this.rules()
            .then(rules => {
                const rule = rules.find(rule => rule.key === key && rule.language === language);
                if (!rule) {
                    throw new Error(`Rule with key ${key} and language ${language} not found`);
                }
                return rule;
            });
    }
}

export interface Repository {
    specification: RepositorySpecification;
    rules: {
        [key: string]: {
            [language: string]: Rule
        }
    };
}

interface RepositorySpecification {
    scmRevisionDate: string;
    title: string;
    version: string;
    scmRevisionNumber: string;
}

export interface Rule {
    key: string;
    language: string;
    links: Link[];
    terms: { [lang: string]: string };
    defaultSeverity: RuleSeverity;
    type: RuleType;
    status: RuleStatus;
    tags: string[];
}

export class RuleInfo implements Rule {
    readonly key: string;
    readonly language: string;
    readonly links: Link[];
    readonly terms: { [lang: string]: string; };
    readonly defaultSeverity: RuleSeverity;
    readonly type: RuleType;
    readonly status: RuleStatus;
    readonly tags: string[];

    readonly title: string;
    readonly localizedTerms: string[];
    private readonly descriptionLink: Link;

    constructor(
        readonly rule: Rule,
        public readonly lang: string
    ) {
        this.lang = lang;
        this.descriptionLink = rule.links.filter(link => link.rel === 'description' && link.hreflang === this.lang)[0];
        if (!this.descriptionLink) {
            throw new Error(`Rules details for user language ${this.lang} not found`);
        }
        this.localizedTerms = [rule.key.toLowerCase(), ...rule.terms[this.lang].split(/\s+/).filter(term => term.length > 0)];
        this.key = rule.key;
        this.language = rule.language;
        this.links = rule.links;
        this.terms = rule.terms;
        this.defaultSeverity = rule.defaultSeverity;
        this.type = rule.type;
        this.status = rule.status;
        this.tags = rule.tags;
        this.title = this.descriptionLink.title ?? "";
    }

    public fetchDescription(fetch: typeof globalThis.fetch): Promise<string> {
        return fetch(`/${this.descriptionLink.href}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching rule description: ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => text.replace(/(<\/?h)(\d)/g, function (_, tag, level) {
                return tag + (parseInt(level) + 1);
            }));
    }
}

interface Link {
    rel: LinkRel;
    href: string;
    title?: string;
    hreflang?: string;
}

declare type LinkRel =
    | "description"
    | "metadata"
    ;

export declare type RuleType =
    | "CODE_SMELL"
    | "BUG"
    | "VULNERABILITY"
    | "SECURITY_HOTSPOT"
    ;

export declare type RuleStatus =
    | "draft"
    | "ready"
    | "deprecated"
    ;

export declare type RuleSeverity =
    | "Blocker"
    | "Critical"
    | "Major"
    | "Minor"
    | "Info"
    ;

const RULE_SEVERITY_WEIGHT: { [key in RuleSeverity]: number } = {
    Blocker: 0,
    Critical: 1,
    Major: 2,
    Minor: 3,
    Info: 4,
};

const SORT_STRINGS = (a: string, b: string) => a.localeCompare(b);
const SORT_SEVERITY = (a: RuleSeverity, b: RuleSeverity) => RULE_SEVERITY_WEIGHT[a] - RULE_SEVERITY_WEIGHT[b];

export interface Filters {
    search?: string;
    language: string[];
    tag: string[];
    type: RuleType[];
    defaultSeverity: RuleSeverity[];
    status: RuleStatus[];
}
