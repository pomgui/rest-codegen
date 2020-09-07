import { PiComponentConfig, PiProjectConfig } from "../configType";
import { PiField } from '@pomgui/rest-lib';
import { config } from "../config";
import { asComment } from '../tools';

export abstract class PiFileView {

    fileName: string = '';
    name: string = '';
    mustache: string;

    constructor(protected proj: PiProjectConfig, protected cfg: PiComponentConfig, protected baseName?: string) {
        if (baseName) {
            this.name = cfg.name(baseName);
            this.fileName = this.setFileExt('.ts');
        }
        this.mustache = cfg.mustache!.file!;
    }

    setFileExt(ext: string): string {
        if (!this.cfg)
            throw new Error('Cannot setFileExt because no baseName has been defined!');
        return this.fileName = this.cfg.file(this.baseName!, ext);
    }

    abstract prepareView(): object;

    protected createProperty(def: any, requiredFields: string[], prefix: string = '')
        : { property: PiField, imports: string[] } {
        let imports: string[] = [];
        let property: PiField = {
            comment: asComment(def.description, prefix),
            name: def.name,
            required: def.required || requiredFields.includes(def.name),
            jsType: 'any'
        }
        this.inferType(def, imports, property);

        return { property, imports };
    }

    protected inferType(def: any, imports: string[], field: PiField): void {
        if (def.type == 'array') {
            this.inferType(def.items, imports, field);
            field.isArray = true;
            field.type += '[]';
            return;
        } else if (def.type) {
            this._toJsType(def, field);
            return;
        } else if (def.$ref) {
            field.type = def.$ref.replace(/^#\/definitions\//, '');
            field.type = this.proj.model.name(field.type!);
            imports.push(field.type);
            this._lookupJsType(field);
            return;
        }
        else if (def.schema) {
            return this.inferType(def.schema, imports, field);
        } else {
            // Assumes type == object
            def.type = 'object';
            return this._toJsType(def, field)
        }
    }

    private _lookupJsType(field: PiField): void {
        let defs = config.yaml.definitions || {};
        let key: string = Object.keys(defs).find((f: string) => this.proj.model.name(f) == field.type)!;
        if(!key)
            throw new Error(`Error: OpenApi inconsistency: type '${field.type}' not defined!`);
        this.inferType(defs[key], [], field);
    }

    private _toJsType(def: any, field: PiField): void {
        switch (def.type) {
            case 'integer':
                field.type = 'number';
            case 'number':
            case 'boolean':
            case 'string':
                if (def.type == 'string') {
                    if (def.format && def.format.startsWith('date')) {
                        field.jsType = 'date';
                        field.type = field.type || 'Date';
                        break;
                    } else if (def.enum) {
                        field.values = def.enum;
                        field.type = field.type
                            || '(' + def.enum.map((s: string) => s.replace(/^|$/g, "'")).join(`|`) + ')'
                        field.jsType = 'enum';
                        break;
                    }
                }
                field.jsType = def.type;
                break;
            case 'object':
                // It can have properties of its own, but they will be ignored in this version
                field.jsType = 'any';
                break;
            default:
                console.warn('type: "' + def.type + '" not recognized');
                field.jsType = def.type;
        }
        if (!field.type) field.type = field.jsType;
    }

}
