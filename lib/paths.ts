import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import * as tools from './tools';

const
    T = '    ';

export function writeApiFiles(paths: any) {
    let files = getTags(paths);
    Object.entries(files)
        .forEach(([name, methodList]) => writeApiFile(name, methodList));
    const names = Object.keys(files);
    const lines = [];
    const servicesList = names.map(f => {
        const service = tools.camelCase(f) + 'Api';
        lines.push(`export * from './${f}';`);
        lines.push(`import { ${service} } from './${f}';`);
        return service;
    });
    lines.push('// Generated services list\nexport const servicesList = [\n' +
        servicesList.join(', ') + '\n];');
    fs.writeFileSync(path.join(config.serviceDir, 'index.ts'),
        lines.join('\n'),
        'utf8'
    );
}

function getTags(paths: any): object {
    let tags: any = {};
    Object.entries(paths)
        .map(([uri, path]: [string, any]) => (path.$$uri = uri, path))
        .forEach(path => {
            Object.entries(path)
                .filter(([$$method, operation]: [string, any]) => ['get', 'post', 'delete', 'put', 'patch', 'option'].includes($$method))
                .forEach(([$$method, operation]: [string, any]) => {
                    operation.$$method = $$method;
                    let tag = operation.tags && operation.tags[0] || 'operations';
                    let list = tags[tag] || (tags[tag] = []);
                    operation.path = path;
                    list.push(operation);
                })
        });
    return tags;
}

function writeApiFile(name: string, operations: any[]): void {
    let code = '';
    let entities: string[] = [];
    code += 'export class ' + tools.camelCase(name) + 'Api {\n';
    code += operations.map(writeOperation).join('\n\n') + '\n';
    code += '}';

    let piserviceImports = operations
        .map(o => o.$$method).filter(tools.distinct)
        .map(o => 'Pi' + o.toUpperCase());
    if (config.includeExtraParams)
        piserviceImports.push('PiExtraParams');
    piserviceImports.push('PiRestError');

    let impCode = `import { ${piserviceImports.join(', ')} } from '@pomgui/rest';\n`;
    if (entities.length)
        impCode += `import * as model from '../model';\n`;
    impCode += `import * as param from '../model/param';\n\n`;

    code = impCode + code;
    fs.writeFileSync(path.join(config.serviceDir, name + '.ts'), code, 'utf8');

    return;

    function writeOperation(operation: any): string {
        let code = '';
        if (operation.summary || operation.description)
            code += tools.asComment([operation.summary, operation.description], T);
        code += T + `@Pi${operation.$$method.toUpperCase()}('${operation.path.$$uri}')\n`;
        code += T + 'async ' + operation.operationId + '(';
        code += `params: param.${tools.camelCase(operation.operationId)}Params`;
        if (config.includeExtraParams) code += ', extra: PiExtraParams';
        code += '): ';

        let errors: any[] = [];
        let returnType = returnTypeOf(operation, errors);
        code += `Promise<${returnType}> {\n`
        errors.forEach(err => {
            code += `${T + T}if(/*condition*/false)\n`;
            code += `${T + T + T}throw new PiRestError('${err.message}', ${err.status});\n`
        })
        if (returnType != 'void') {
            code += T + T + `let value: ${returnType} = <${returnType}> ${returnType.endsWith('[]') ? '[]' : '{}'};\n`
            code += T + T + '/* fill \'value\' here */\n'
            code += T + T + `return value;\n`;
        } else
            code += '\n' + T + T + '/* operation\'s code */\n'
        code += T + '}'
        return code;
    }

    function returnTypeOf(operation: any, errors: any[]): string {
        let returnType: string;

        Object.entries(operation.responses)
            .forEach(([status, response]: [string | number, any]) => {
                status = Number(status);
                if (status >= 200 && status < 300) {
                    if (response.schema)
                        returnType = tools.inferType(response.schema, entities, 'model');
                } else if (!Number.isNaN(status))
                    errors.push({ status, message: response.description || 'Error ' + status });
            })
        return returnType! || 'void';
    }
}