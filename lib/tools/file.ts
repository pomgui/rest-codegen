import path from 'path';
import fs from 'fs';

function mkdirp(apath: string): void {
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

function relativePath(from: string, to: string): string {
    let relative = path.relative(from, to);
    if (!relative.startsWith('.')) relative = './' + relative;
    return relative;
}

function cleanDir(dir: string): void {
    fs.readdirSync(dir)
        .forEach(f => {
            f = path.join(dir, f);
            if (!fs.statSync(f).isDirectory())
                fs.unlinkSync(f)
        });
}

/**
 * Common part between 2 absolute paths (using unix separator "/")
 * @param pathA 
 * @param pathB 
 */
function commonPath(pathA: string, pathB: string): string {
    let a = pathA.split('/'),
        b = pathB.split('/'),
        i = 0;
    for (; i < a.length && i < b.length; i++)
        if (a[i] != b[i]) break;
    return a.slice(0, i).join('/');
}

export const fs2 = {
    mkdirp,
    relativePath,
    cleanDir,
    commonPath
}