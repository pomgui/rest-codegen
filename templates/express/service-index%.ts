{{#files}}
import { {{name}} } from './{{name}}';
{{/files}}

export { {{filesCsv}} };

export const services = [{{filesCsv}}];
