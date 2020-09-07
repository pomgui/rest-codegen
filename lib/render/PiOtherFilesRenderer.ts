import { PiRenderer } from "./PiRenderer";
import { PiProjectConfig, PiComponentConfig } from "../configType";
import { file, name } from "../config";
import klaw from 'klaw';
import path from 'path';
import { PiOtherTemplFileView } from "../view/PiOtherTemplFileView";

export class PiOtherFilesRenderer extends PiRenderer {
    constructor(proj: PiProjectConfig) {
        super('other', proj,
            Object.assign(
                <PiComponentConfig>{ beforeAll: 'none', file, name },
                proj.other
            ),
            false);
    }

    protected populateFiles(): Promise<void> {
        return new Promise((resolve, reject) => {
            klaw(this.cfg.mustache!.dir!)
                .on('data', item => {
                    let basename = path.basename(item.path);
                    if (!item.stats.isDirectory() && !basename.includes('%')) {
                        let relative = path.relative(this.cfg.mustache!.dir!, item.path);
                        let outFile = path.join(this.proj.dir, relative);
                        this.files.push(new PiOtherTemplFileView(this.proj, outFile, item.path))
                    }
                })
                .on('end', resolve)
                .on('error', reject)
        })
    }
}
