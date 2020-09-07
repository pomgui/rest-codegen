import { PiRenderer } from "./PiRenderer";
import { PiProjectConfig } from "../configType";
import { config } from "../config";
import { PiModelFileView } from "../view/PiModelView";
import path from 'path';

export class PiModelFilesRenderer extends PiRenderer {
    constructor(proj: PiProjectConfig) {
        super('model', proj, proj.model, true);
    }

    protected async populateFiles(): Promise<void> {
        this.files.files =
            Object.values(config.yaml.definitions)
                .map((def: any) => new PiModelFileView(this.proj, def.name, def));
    }
}
