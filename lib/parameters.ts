import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import * as tools from './tools';

const
    T = '    ';

export const paramsOf = (obj: any) => 'parameters' in obj ? obj.parameters : [];

export function writeParamFiles(paths: any): void {
    let files: string[] = [];
    Object.entries(paths)
        .forEach(([uri, path]: [string, any]) => {
            Object.keys(path)
                .filter(props => ['get', 'post', 'delete', 'put', 'patch', 'option'].includes(props))
                .map(method => [method, path[method]])
                .forEach(([method, operation]) => {
                    let file = tools.camelCase(operation.operationId);
                    let params = [...paramsOf(path), ...paramsOf(operation)];
                    writeParamFile(uri, method, operation, file, params);
                    files.push(file);
                });
        });
    fs.writeFileSync(
        path.join(config.modelDir, 'param', 'index.ts'),
        files.map(f => `export * from './${f}';`).join('\n'),
        'utf8'
    );
}

function writeParamFile(uri: string, method: string, operation: any, file: string, params: any[]) {
    params.forEach((p, i) => '$ref' in p && (params[i] = replaceRef(p.$ref)));

    let importList: string[] = [];
    let extendList: string[] = [];
    let code = ['header', 'query', 'path', 'body', '']
        .map(type => writeParams(type, params.filter(p => p.in == type), type ? [] : extendList))
        .filter(c => c)
        .join('\n\n');
    code =
        tools.asComment([`Parameters for ${method.toUpperCase()} ${uri}`, operation.summary, operation.description]) + '\n'
        + importList.map(i => `import { ${i} } from '../${i}';`).join('\n') + '\n\n'
        + code;

    fs.writeFileSync(path.join(config.modelDir, 'param', file + '.ts'), code, 'utf8');
    return;

    function writeParams(type: string, params: any[], _extends: string[]): string {
        if (type && !params.length)
            return '';
        let name = file + 'Params' + tools.camelCase(type);
        let paramCode = tools.asComment(type ? 'Parameters sent in the ' + type : 'Structure with ALL the operation parameters')
            + `export interface ${name} ${_extends.length ? 'extends ' + _extends.join(', ') : ''} {\n`;
        extendList.push(name);
        params.forEach(param => {
            let { code, imports, meta } = tools.writeAttrib(param, [], T);
            importList.push(...imports);
            paramCode += code;
        });
        paramCode += '}';
        return paramCode;
    }

    function replaceRef(ref: string) {
        if (!ref.startsWith('#/')) {
            console.error('$ref: "' + ref + '" invalid!');
            process.exit(1);
        }
        let r = ref.split('/'), o = config.yaml;
        for (let i = 1; i < r.length; i++) {
            o = o[r[i]];
        }
        return o;
    }
}
