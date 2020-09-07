import { PiProjectConfig } from "../configType";
import { PiTypeFileView } from './PiTypeFileView';
import { PiFileView } from './PiFileView';
import { PiFieldDescriptor, PiField } from '@pomgui/rest-lib';
import { misc, TAB, asComment } from "../tools";

export class PiModelFileView extends PiFileView {
    constructor(protected proj: PiProjectConfig, baseName: string, protected def: any) {
        super(proj, proj.model, baseName);
    }
    prepareView(): object {
        let view = new PiTypeFileView(this.proj);
        view.name = this.name;

        if (!this.def.type || this.def.type == 'object')
            this._isInterface(view);
        else if (this.def.type == 'string' && this.def.enum)
            this._isEnum(view);
        else
            this._isAlias(view);
        return view;
    }

    private _isInterface(view: PiTypeFileView) {
        let me = this;
        let props: PiFieldDescriptor[] = [];
        let intf = {
            comment: this.def.description,
            name: this.name,
            extends: '',
            properties: props
        };
        view.interfaces.push(intf);

        let extendList: string[] = [];
        let importList: string[] = [];

        if (this.def.allOf)
            this.def.allOf.forEach((obj: any) => {
                if (obj.$ref) {
                    let type = this.cfg.name(obj.$ref.replace(/.*\//, ''));
                    extendList.push(type);
                    importList.push(type);
                } else
                    addProperties(obj, obj.required || []);
            })
        else if (this.def.oneOf || this.def.anyOf) {
            // TODO: Create a new interface (above this one) and make: Ex.
            //    type PiAccount = PiAccountBase | PiAccountId | ...
            throw new Error('"oneOf|anyOf" Not Implemented');
        } else if (this.def.properties)
            addProperties(this.def, this.def.required || []);

        intf.extends = misc.join(extendList);
        view.imports.push({
            module: './',
            items: misc.join(importList)
        });
        return;

        function addProperties(type: any, requiredFields: string[]): void {
            Object.entries(type.properties)
                .map(([name, def]: [string, any]) => Object.assign({ name }, def))
                .forEach(def => {
                    let { property, imports } = me.createProperty(def, requiredFields, TAB);
                    importList.push(...imports);
                    intf.properties.push(new PiFieldDescriptor(property));
                });
        }
    }
    private _isEnum(view: PiTypeFileView) {
        view.enums.push({
            comment: asComment(this.def.description),
            name: this.name,
            values: this.def.enum
        })
    }
    private _isAlias(view: PiTypeFileView) {
        let imports: string[] = [];
        let field: PiField = <any>{};
        this.inferType(this.def, imports, field);
        view.alias.push({
            comment: asComment(this.def.description),
            name: this.name,
            type: field.type!
        });
        view.imports.push({
            module: './',
            items: misc.join(imports)
        });
    }
}