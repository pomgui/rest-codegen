import { PiRenderer } from "./PiRenderer";
import { PiProjectConfig } from "../configType";
import { config } from "../config";
import { PiParamsFileView } from "../view/PiParamsFileView";

export class PiParamFilesRenderer extends PiRenderer {
    constructor(proj: PiProjectConfig) {
        super('parameter', proj, proj.params, true);
    }

    protected async populateFiles(): Promise<void> {
        Object.values(config.yaml.paths)
            .forEach((_path: any) => {
                Object.values(_path)
                    .filter((operation: any) => operation.$$method)
                    .forEach((operation: any) => {
                        let file = new PiParamsFileView(
                            this.proj,
                            operation.operationId,
                            operation
                        );
                        this.files.push(file);
                    });
            });

    }
}
