import * as yaml from 'js-yaml';

export function obj2frontmatter(obj: any): string {
    if (Object.keys(obj)?.length === 0) {
        return '';
    }
    return `---\n${yaml.dump(obj)}---`;
}

export function getLocaleName(locale: string) {
    const intlNames = new Intl.DisplayNames(['en'], {type: 'language', languageDisplay: "standard"});
	return intlNames.of(locale) || 'English';
}
