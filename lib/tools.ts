import * as path from 'path';
import * as fs from 'fs';

export const camelCase = (n: string) => n ? n.substr(0, 1).toUpperCase() + n.substr(1) : '';
export const distinct = (v: any, i: number, s: Array<any>) => s.indexOf(v) === i;

export function asComment(s: string | string[], prefix: string = ''): string {
    if (Array.isArray(s))
        s = s.filter(i => i && i.trim()).join('\n');
    s = wrap(s.trim());
    return ''
        + prefix + '/**'
        + prefix + ('\n' + s).replace(/\n/g, '\n' + prefix + ' * ') + '\n'
        + prefix + ' */\n';

    function wrap(text: string): string {
        let lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let text = lines[i];
            while (text.length > 80) {
                let newText = '';
                let p2 = Math.min(80, text.length);
                if (p2 < text.length) {
                    while (!/\s/.test(text.charAt(p2)) && p2 > 0) p2--;
                    if (p2 <= 0) p2 = 80;
                }
                newText += text.substr(0, p2).trim();
                lines.splice(i++, 0, newText);
                text = text.substr(p2).trim();
            }
            lines[i] = text;
        }
        return lines.join('\n');
    }
}

export function regexIndexOf(text: string, re: RegExp, startpos = 0): number {
    var indexOf = text.substring(startpos).search(re);
    return indexOf >= 0 ? indexOf + startpos : indexOf;
}

export function mkdirp(apath: string): void {
    if (!apath.endsWith(path.sep)) apath += path.sep;
    for (let p; (p = apath.lastIndexOf(path.sep, p)) >= 0; p--) {
        let dir = apath.substr(0, p);
        if (fs.existsSync(dir)) {
            while ((p = apath.indexOf(path.sep, p + 1)) >= 0) {
                dir = apath.substr(0, p);
                fs.mkdirSync(dir);
            }
            return;
        }
    }
}

export function writeAttrib(def: any, requiredFields: string[], prefix: string = ''): { code: string, imports: string[], meta: string } {
    let code = '';
    let meta = '';
    let imports: string[] = [];

    if (def.description)
        code += asComment(def.description, prefix);
    code += prefix + def.name;
    if (!def.required && !requiredFields.includes(def.name))
        code += '?';
    code += ': ' + inferType(def, imports) + ';\n';
    return { code, imports, meta };
}

export function inferType(def: any, imports: string[], module?: string): string {
    if (def.type == 'array')
        return inferType(def.items, imports, module) + '[]';
    else if (def.type)
        return toJsType(def);
    else if (def.$ref) {
        let entity = def.$ref.replace(/^#\/definitions\//, '');
        imports.push(entity);
        return (module ? module + '.' : '') + entity;
    }
    else if (def.schema) {
        return inferType(def.schema, imports, module);
    } else
        throw new Error(`Cannot infer type for '${def.name}'`)
}

export function toJsType(def: any) {
    switch (def.type) {
        case 'integer': def.type = 'number';
        case 'number':
        case 'boolean':
        case 'Date':
        case 'string':
            if (def.type == 'string') {
                if (def.format && def.format.startsWith('date'))
                    def.type = 'Date';
                if (def.enum)
                    def.type = def.enum.map((s: string) => s.replace(/^|$/g, "'")).join(`|`)
            }
            return def.type;
        case 'object':
            // It can have properties of its own, but they will be ignored in this version
            return 'any';
        default:
            console.warn('type: "' + def.type + '" not recognized');
            return def.type;
    }
}
