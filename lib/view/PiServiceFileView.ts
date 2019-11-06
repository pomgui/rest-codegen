import { PiServiceOperationErrorView, PiServiceOperationView } from "./PiServiceOperationView";
import { PiProjectConfig } from "../configType";
import { config } from "../config";
import { PiTypeFileView } from "./PiTypeFileView";
import { PiFileView } from "./PiFileView";
import { PiField } from "pirest-lib";
import { code, misc, fs2, str } from "../tools";
import fs from 'fs';

export class PiServiceFileView extends PiFileView {
    constructor(proj: PiProjectConfig, baseName: string, protected defs: any[]) {
        super(proj, proj.service, baseName);
    }

    prepareView(): object {
        let view = new PiTypeFileView();
        let me = this;
        let tag = config.yaml.tags.find((t: any) => t.name == this.baseName);
        if (!tag) tag = {};
        view.comment = code.asComment(tag.description);
        let paramImports: string[] = [];
        let modelImports: string[] = [];
        let pirestImports: string[] = [];
        let operations: PiServiceOperationView[] =
            this.defs.map(o => {
                let allParamsType = this.proj.params.name(o.operationId);
                let descriptorName = o.operationId + '$';
                let errors: PiServiceOperationErrorView[] = [];
                if (this.proj.type == 'express') {
                    pirestImports.push('Pi' + o.$$method);
                    paramImports.push(allParamsType);
                }
                paramImports.push(descriptorName);
                let { parameters, apiParams } = createParams(o);
                let operation: PiServiceOperationView = {
                    comment: code.asComment([o.summary, o.description], code.TAB),
                    name: o.operationId,
                    allParamsType,
                    parameters,
                    apiParams: this.proj.type == 'angular' ? apiParams : '',
                    extraParam: !!this.proj.service.extraParam,
                    httpMethod: o.$$method.toLowerCase(),
                    httpMETHOD: o.$$method,
                    uri: o.$$uri.replace(/\{(.*?)\}/g, ':$1'), // express notation
                    errors,
                    returnType: this._returnTypeOf(o, errors, modelImports)
                };
                if (this.proj.type == 'express') {
                    if (errors.length)
                        pirestImports.push('PiRestError');
                    if (!!this.proj.service.extraParam)
                        pirestImports.push('PiExtraParams');
                }
                operation.returnsVoid = operation.returnType == 'void';
                return operation;
            });
        view.services.push({
            name: this.name,
            basePath: config.yaml.basePath,
            operations
        });
        view.imports.push(
            { module: 'pirest', items: misc.join(pirestImports) },
            { module: getImportModule('model'), items: misc.join(modelImports) },
            { module: getImportModule('params'), items: misc.join(paramImports) }
        );
        // fs.writeFile('/tmp/picodegen/' + this.name + '.view.json', JSON.stringify(view, null, 2), 'utf8', (err) => { if(err) throw err });
        return view;

        function getImportModule(type: string): string {
            let path;
            if (!(path = (<any>me.proj)[type].dirAlias))
                path = fs2.relativePath(me.proj.service.dir, (<any>me.proj)[type].dir);
            return path;
        }

        function createParams(o: any): { parameters: PiField[], apiParams: string } {

            let parameters: PiField[] = [];
            let apiParamsDict: { [name: string]: string[] } = {};
            let apiParams;
            // path and body parameters will be listed one by one
            ['path', 'body'].forEach(ptype =>
                o.parameters.filter((p: any) => p.in == ptype)
                    .forEach((p: any) => {
                        let { property, imports } = me.createProperty(p, [], code.TAB + code.TAB);
                        modelImports.push(...imports);
                        parameters.push(property);
                        (apiParamsDict[ptype] || (apiParamsDict[ptype] = [])).push(property.name);
                    })
            );
            // query and header parameters will be listed as a structure
            ['query', 'header'].forEach(ptype => {
                let name = ptype == 'header' ? 'headers' : ptype;
                if (o.parameters.find((p: any) => p.in == ptype)) {
                    let type: any = me.proj.params.name(o.operationId + str.camelCase(ptype));
                    paramImports.push(type);
                    parameters.push({
                        comment: code.asComment(ptype + ' parameters'),
                        name,
                        required: true,
                        type,
                        jsType: 'any',
                        isArray: false
                    });
                    apiParamsDict[name] = []
                }
            });
            apiParams = '{ ' + Object.entries(apiParamsDict).map(([name, list]) =>
                name + (!list.length ? '' : ': { ' + list.join(', ') + ' }')
            ).join(', ') + ' }';

            return { parameters, apiParams };
        }
    }

    private _returnTypeOf(operation: any, errors: any[], entities: string[]): string {
        let returnType: string;

        if (!operation.responses)
            console.warn(`operation '${operation.operationId}': (${operation.$$method} ${operation.$$uri}) does not have any 'responses' defined.`)
        else
            Object.entries(operation.responses)
                .forEach(([status, response]: [string | number, any]) => {
                    status = Number(status);
                    if (status >= 200 && status < 300) {
                        if (response.schema) {
                            let field: PiField = <any>{};
                            this.inferType(response.schema, entities, field);
                            returnType = field.type!;
                        }
                    } else if (!Number.isNaN(status))
                        errors.push({ status, message: response.description || 'Error ' + status });
                })
        return returnType! || 'void';
    }

}

