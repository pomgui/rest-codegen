import { PiComponentConfig } from "../configType";
import { PiFileView } from "./PiFileView";
import { PiTypeDescriptor } from '@pomgui/rest-lib';
import { JSONtoJS } from '../tools';

export class PiFileList {
    private _files: PiFileView[] = [];

    constructor(protected cfg: PiComponentConfig, protected dfltTemplate: string) { }

    filesCsv(): string {
        return this._files.map(f => f.name).join(', ')
    }

    descriptors(): { name: string, value: string }[] | undefined {
        const descriptors: PiTypeDescriptor[] = [];
        this._files.forEach(file => {
            const desc = (file as any).descriptors;
            if (!desc) return;
            descriptors.push(...desc);
        });
        return descriptors.map(d => ({
            name: d.name,
            value: JSONtoJS(d.render())
        }));
    }

    push(file: PiFileView) {
        this._files.push(file);
    }
    set files(list: PiFileView[]) {
        this._files = list;
    }
    get files() { return this._files; }

}

