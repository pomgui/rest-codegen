{{#imports}}
{{#items}}
import { {{.}} } from '{{module}}';
{{/items}}
{{/imports}}

{{#services}}
export class {{name}} {
    {{#operations}}
    @Pi{{httpMETHOD}}('{{uri}}', {descriptor: {{name}}$})
    async {{name}}(params: {{allParamsType}}{{#extraParam}}, extra: PiExtraParams{{/extraParam}}): Promise<{{returnType}}> {
        {{#errors}}
        if(/* condition */false)
            throw new PiRestError('{{message}}', {{status}});
        {{/errors}}
        {{^returnsVoid}}
        let value: {{returnType}} = <{{returnType}}>{};
        /* fill 'value' here */
        return value;
        {{/returnsVoid}}
    }

    {{/operations}}
}
{{/services}}