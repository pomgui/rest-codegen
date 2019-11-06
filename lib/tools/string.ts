function regexIndexOf(text: string, re: RegExp, startpos = 0): number {
    var indexOf = text.substring(startpos).search(re);
    return indexOf >= 0 ? indexOf + startpos : indexOf;
}

function rpad(s: string, len: number): string {
    return (s + ' '.repeat(len - s.length)).substr(0, len);
}

const camelCase = (n: string) => n ? n.substr(0, 1).toUpperCase() + n.substr(1) : '';

export const str = {
    regexIndexOf,
    rpad,
    camelCase
}