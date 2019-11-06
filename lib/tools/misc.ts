const distinct = (v: any, i: number, s: Array<any>) => s.indexOf(v) === i;

function copy(dst: any, src: any): void {
    Object.entries(src)
        .forEach(([key, value]: [string, any]) => {
            if (!(value instanceof Date) && typeof value == 'object') {
                if (!dst[key])
                    dst[key] = Array.isArray(src[key]) ? [] : {};
                copy(dst[key], value);
            } else
                dst[key] = value;
        });
}

function join(arr: any[]): string {
    return arr.filter(distinct).join(', ');
}

export const misc = {
    distinct,
    copy,
    join
};