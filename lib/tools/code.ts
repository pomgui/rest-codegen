export const TAB = '    ';

export function asComment(s: string | string[], prefix: string = ''): string {
    if (!s || !s.length) return '';
    if (Array.isArray(s))
        s = s.filter(i => i && i.trim()).join('\n');
    s = wrap(s.trim());
    if (!s) return '';
    else if (!s.includes('\n')) return '/** ' + s + ' */';
    else return ''
        + '/**'
        + (!s.includes('\n') ? s : prefix + ('\n' + s).replace(/\n/g, '\n' + prefix + ' * ') + '\n')
        + prefix + ' */';

}

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

export function JSONtoJS(obj: any, tab?: number): string {
    return JSON.stringify(obj, null, tab)
        .replace(/"([^"]+)":/g, '$1:').replace(/"/g, '\'');
}