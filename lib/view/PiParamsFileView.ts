import { PiProjectConfig } from "../configType";
import { PiTypeFileView } from './PiTypeFileView';
import { PiFileView } from './PiFileView';
import { PiFieldDescriptor, PiTypeDescriptor } from 'pirest-lib';
import { str, code, misc, fs2 } from "../tools";

export class PiParamsFileView extends PiFileView {

    constructor(proj: PiProjectConfig, baseName: string, protected operation: any) {
        super(proj, proj.params, baseName);
    }

    prepareView(): object {
        let view = new PiTypeFileView();
        let extendList: string[] = [];
        let importList: string[] = [];
        let descriptor = new PiTypeDescriptor();

        view.name = this.name;
        view.comment = code.asComment([
            `Parameters for operation '${this.baseName}' (${this.operation.$$method} ${this.operation.$$uri})`,
            this.operation.summary,
            this.operation.description
        ]);
        ['header', 'query', 'path', 'body', 'all']
            .forEach(source => { // 'all' represents all the parameters, but there's no "all" in the openapi structure
                let params: any[] = this.operation.parameters.filter((p: any) => p.in == source);
                let intfName = this.cfg.name(this.baseName + (source == 'all' ? '' : str.camelCase(source)));
                if (source != 'all') {
                    if (!params.length) return;
                    extendList.push(intfName);
                }

                view.interfaces.push({
                    comment: code.asComment(source != 'all'
                        ? 'Parameters sent in the ' + source
                        : 'Structure with ALL the operation parameters'),
                    name: intfName,
                    extends: source == 'all' ? misc.join(extendList) : '',
                    properties: params.map(p => {
                        let { property, imports } = this.createProperty(p, [], code.TAB);
                        const field = new PiFieldDescriptor(property);
                        importList.push(...imports);
                        descriptor.set(field);
                        return field;
                    })
                });

                if (source == 'all')
                    view.descriptor = {
                        name: this.operation.operationId + '$',
                        value: JSON.stringify(descriptor.render())
                    };
            });

        view.imports.push({
            module: this.proj.model.dirAlias || fs2.relativePath(this.cfg.dir, this.proj.model.dir),
            items: misc.join(importList)
        });

        return view;
    }
}
