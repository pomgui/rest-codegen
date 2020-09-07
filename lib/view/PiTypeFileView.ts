import { PiFieldDescriptor } from '@pomgui/rest-lib';
import { PiServiceOperationView } from "./PiServiceOperationView";
import { PiProjectConfig } from '../configType';
/**
 * View that be used for parameters, model, and services files.
 * It contains all the necessary elements to create mustache templates
 */
export class PiTypeFileView {
    name: string = '';
    comment?: string;
    imports: {
        module: string;
        items: string;
    }[] = [];
    interfaces: {
        comment?: string;
        name: string;
        extends?: string;
        properties: PiFieldDescriptor[];
    }[] = [];
    descriptor?: { name: string; value: string };
    enums: {
        comment?: string;
        name: string;
        values: string[];
    }[] = [];
    alias: {
        comment?: string;
        name: string;
        type: string;
    }[] = [];
    services: {
        comment?: string;
        name: string;
        basePath: string,
        operations: PiServiceOperationView[];
    }[] = [];


    constructor(public cfg: PiProjectConfig) { }
};
