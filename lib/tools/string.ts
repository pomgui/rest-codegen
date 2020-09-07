function regexIndexOf(text: string, re: RegExp, startpos = 0): number {
    var indexOf = text.substring(startpos).search(re);
    return indexOf >= 0 ? indexOf + startpos : indexOf;
}

const camelCase = (n: string) => n ? n.substr(0, 1).toUpperCase() + n.substr(1) : '';

export const str = {
    regexIndexOf,
    camelCase
}