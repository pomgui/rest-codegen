import { PiRenderer } from "./PiRenderer";
import { PiProjectConfig } from "../configType";
import { config } from "../config";
import { PiServiceFileView } from "../view/PiServiceFileView";

export class PiServiceFilesRenderer extends PiRenderer {
    constructor(proj: PiProjectConfig) {
        super('service', proj, proj.service, true);
    }

    protected async populateFiles(): Promise<void> {
        this.files.files =
            Object.entries(getTags(config.yaml.paths))
                .map(([baseName, operationDefs]) =>
                    new PiServiceFileView(this.proj, baseName, operationDefs)
                );
    }
}

function getTags(paths: any): object {
    let tags: any = {};
    Object.values(paths)
        .forEach((path: any) => {
            Object.values(path)
                .filter((operation: any) => operation.$$method)
                .forEach((operation: any) => {
                    let tag = operation.tags && operation.tags[0] || 'operations';
                    let list = tags[tag] || (tags[tag] = []);
                    list.push(operation);
                })
        });
    return tags;
}