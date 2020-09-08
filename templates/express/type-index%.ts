{{#files}}
export * from './{{name}}';
{{/files}}

export const descriptors = {
{{#descriptors}}
    {{name}}: {{value}},
{{/descriptors}}
}
