import * as fs from 'fs';
import * as path from 'path';
import * as tools from './tools';
import { config } from './config';

const
    T = '    ';

export function writeModel(defs: any): void {
    let files: string[] = [];
    Object.entries(defs)
        .map(([name, def]) => Object.assign({ name }, def))
        .forEach(def => {
            let file = path.join(config.modelDir, def.name + '.ts');
            files.push(def.name);
            writeFile(def, file);
        });
    fs.writeFileSync(
        path.join(config.modelDir, 'index.ts'),
        files.map(f => `export * from './${f}';`).join('\n'),
        'utf8'
    );
}

function writeFile(def: any, file: string): void {
    let code;

    if (!def.type || def.type == 'object')
        code = writeObject(def);
    else if (def.type == 'string' && def.enum)
        code = writeEnum(def);
    else
        code = writePrimitiveAlias(def);

    fs.writeFileSync(file, code, 'utf8');
    return;
}

function writeEnum(def: any): string {
    let code = `export enum ${def.name} {\n`;
    def.enum.forEach((e: string) => code += T + e + ` = '${e}',\n`);
    code += '}'
    return code;
}

function writePrimitiveAlias(def: any): string {
    let imports: string[] = [];
    let code = `export type ${def.name} = ${tools.inferType(def, imports)};`
    if (imports.length)
        code = `import { ${imports.sort().join(', ')} from './';\n\n`
            + code;
    return code;
}

function writeObject(def: any): string {
    let headerCode = 'export interface ' + def.name + ' {\n';
    let importList: string[] = [];
    let extendFromList: string[] = [];
    let propertiesCode = '';

    if (def.description)
        headerCode = tools.asComment(def.description) + headerCode;
    if (def.allOf)
        def.allOf.forEach((obj: any) => {
            if (obj.$ref) {
                let type = obj.$ref.replace(/.*\//, '');
                extendFromList.push(type);
                importList.push(type);
            } else
                writeProperties(obj, obj.required || []);
        })
    else if (def.oneOf || def.anyOf) {
        // TODO: Create a new interface (above this one) and make: Ex.
        //    type PiAccount = PiAccountBase | PiAccountId | ...
        throw new Error('"oneOf|anyOf" Not Implemented');
    } else if (def.properties)
        writeProperties(def, def.required || []);

    if (extendFromList.length)
        headerCode = headerCode.replace(' {', ' extends ' + extendFromList.join(', ') + ' {');
    if (importList.length)
        headerCode = `import { ${importList.sort().join(', ')} } from './';\n\n` + headerCode;

    return headerCode + propertiesCode + '}';

    function writeProperties(type: any, requiredFields: string[]): void {
        Object.entries(type.properties)
            .map(([name, def]: [string, any]) => Object.assign({ name }, def))
            .forEach(def => {
                let { code, imports } = tools.writeAttrib(def, requiredFields, T);
                propertiesCode += code;
                importList.push(...imports);
            });
    }
}
