import { PiProjectConfig } from "../configType";
import { PiModelFilesRenderer } from "./PiModelFilesRenderer";
import { PiParamFilesRenderer } from "./PiParamFilesRenderer";
import { PiServiceFilesRenderer } from "./PiServiceFilesRenderer";
import { PiOtherFilesRenderer } from "./PiOtherFilesRenderer";

export class PiProjectRenderer {
    constructor(protected proj: PiProjectConfig) { }
    render() {
        console.log('Processing project ' + this.proj.type + '...');
        new PiModelFilesRenderer(this.proj).render();
        new PiParamFilesRenderer(this.proj).render();
        new PiServiceFilesRenderer(this.proj).render();
        new PiOtherFilesRenderer(this.proj).render();
    }
}
