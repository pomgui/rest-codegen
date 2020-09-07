import { PiComponentConfig } from "../configType";
import { PiFileView } from "./PiFileView";

export class PiFileList {
    private _files: PiFileView[] = [];

    constructor(protected cfg: PiComponentConfig, protected dfltTemplate: string) { }

    filesCsv(): string {
        return this._files.map(f => f.name).join(', ')
    }

    push(file: PiFileView) {
        this._files.push(file);
    }
    set files(list: PiFileView[]) {
        this._files = list;
    }
    get files() { return this._files; }

}

