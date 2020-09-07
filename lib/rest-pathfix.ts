#!/usr/bin/env node
import klaw from 'klaw';
import path from 'path';
import fs from 'fs';
import { fs2 } from './tools';
/**
 * If the rest-codegen configuration file includes "alias" for
 * paths, then this tool needs to be executed right after the 
 * compiler (tsc), because pure javascript will not recognize the
 * path-alias configured in tsconfig.json, ending up in a runtime
 * error.
 * This tool avoids the need of tools like 
 * tsc-path or webpack to do that in runtime.
 * Usage: Execute it just after tsc in the project's root dir 
 * (where are package.json and tsconfig.json).
 * Ex.
 * tsc && rest-pathfix
 */

verifyTscFile();

const
    appRoot = process.cwd(),
    tsc = normalizeTsc(require(appRoot + '/tsconfig.json').compilerOptions);

main();

function main() {
    klaw(tsc.outDir)
        .on('data', file => {
            let basename = path.basename(file.path);
            if (!file.stats.isDirectory() && basename.endsWith('.js')) {
                let content = fs.readFileSync(file.path, 'utf8');
                let newContent = content;
                tsc.paths.forEach((p: { matcher: RegExp, target: string }) => {
                    let relative = path.relative(path.dirname(file.path), p.target);
                    newContent = newContent.replace(p.matcher, (g, prefix, path, subpath, suffix) =>
                        prefix + relative + subpath + suffix);
                });
                if (newContent !== content) {
                    fs.writeFileSync(file.path, newContent, 'utf8');
                    console.log(path.relative(appRoot, file.path), 'changed.');
                }
            }
        })
        .on('end', () => console.log('done'))
        .on('error', error => console.error(error))
}

function normalizeTsc(opt: any): any {
    const toAbsolute = (o: any, d: string, p: string) => !path.isAbsolute(o[d]) && (o[d] = path.join(p, o[d]));
    opt.module = opt.module || 'commonjs';
    opt.outDir = opt.outDir || '.'; toAbsolute(opt, 'outDir', appRoot);
    opt.baseUrl = opt.baseUrl || '.'; toAbsolute(opt, 'baseUrl', opt.outDir);
    opt.paths = Object.keys(opt.paths || {})
        .map(p => ({
            matcher: (() => {
                let path = p.replace(/^(.*)(\/\*)?$/, (g, _path, end) => '(' + _path + ')(' + (end ? '/[^"]*' : '') + ')');
                if (opt.module == 'commonjs') path = '(require\\(")' + path + '("\\))';
                else throw new Error('module ' + opt.module + ' not implemented yet');
                return new RegExp(path, 'g');
            })(),
            target: (() => {
                let target: any = opt.paths[p];
                toAbsolute(target, '0', opt.baseUrl); // only use the first path (assuming only alias configuration)
                let common = fs2.commonPath(target[0], appRoot);
                return path.join(opt.outDir, path.relative(common, target[0]));
            })()
        }));
    return opt;
}

function verifyTscFile(){
    if(!fs.existsSync('./tsconfig.json')){
        console.error(`No 'tsconfig.json' was found at current directory.`);
        process.exit(1);
    }
}