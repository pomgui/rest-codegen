import { PiFieldDescriptor } from '@pomgui/rest-lib';
import { PiServiceOperationView } from "./PiServiceOperationView";

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
    descriptor?: {name: string; value: string};
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
};
