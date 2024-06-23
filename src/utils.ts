import * as yaml from 'js-yaml';

export function obj2frontmatter(obj: any): string {
    if (Object.keys(obj)?.length === 0) {
        return '';
    }
    return `---\n${yaml.dump(obj)}---`;
}