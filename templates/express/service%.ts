{{#imports}}
{{#items}}
import { {{.}} } from '{{module}}';
{{/items}}
{{/imports}}
{{#cfg.databasePool}}
import { PiDatabase } from '@pomgui/database';
{{/cfg.databasePool}}

{{#services}}
export class {{name}} {
    {{#operations}}
    @Pi{{httpMETHOD}}('{{uri}}'{{#security}}, { security: {{.}} }{{/security}})
    async {{name}}(params: {{allParamsType}}{{#cfg.databasePool}}, db: PiDatabase{{/cfg.databasePool}}): Promise<{{returnType}}> {
        {{#errors}}
        if (/* condition */false)
            throw new PiRestError('{{message}}', {{status}});
        {{/errors}}
        {{^returnsVoid}}
        let value: {{returnType}} = {{returnObj}} as {{returnType}};
        /* fill 'value' here */
        return value;
        {{/returnsVoid}}
    }

    {{/operations}}
}
{{/services}}