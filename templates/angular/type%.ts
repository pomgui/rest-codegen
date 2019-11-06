{{comment}}
{{#imports}}
{{#items}}
import { {{.}} } from '{{module}}';
{{/items}}
{{/imports}}

{{#interfaces}}
{{comment}}
export interface {{name}}{{#extends}} extends {{extends}}{{/extends}} {
    {{#properties}}
    {{comment}}
    {{name}}{{optional}}: {{type}};
    {{/properties}}
}

{{/interfaces}}
{{#descriptor}}
export const {{name}} = {{value}};
{{/descriptor}}
{{#enums}}
{{comment}}
export enum {{name}} {
    {{#values}}
    {{.}} = '{{.}}',
    {{/values}}
}

{{/enums}}
{{#alias}}
{{comment}}
export type {{name}} = {{type}};
{{/alias}}
