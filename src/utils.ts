import * as yaml from 'js-yaml';

export function obj2yaml(obj: any): string {
    if (Object.keys(obj)?.length === 0) {
        return '';
    }
    return `---\n${yaml.dump(obj)}---`;
}