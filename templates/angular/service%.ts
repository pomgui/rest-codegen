import { Injectable } from '@angular/core';
import { PiApiCaller } from 'pirest-angular';
{{#imports}}
{{#items}}
import { {{.}} } from '{{module}}';
{{/items}}
{{/imports}}

{{#services}}
{{comment}}
@Injectable({ providedIn: 'root' })
export class {{name}} {

    constructor(private api: PiApiCaller) { api.basePath = '{{basePath}}'; }

    {{#operations}}
    {{comment}}
    {{name}}(
        {{#parameters}}{{comment}}
        {{name}}{{optional}}: {{type}},
        {{/parameters}}
    ): Promise<{{returnType}}> {
        return this.api.{{httpMethod}}('{{uri}}', {{apiParams}}, {{name}}$);
    }
    {{/operations}}
}
{{/services}}