import fs from 'fs';
import path from 'path';
import Mustache from 'mustache';
import { PiProjectConfig, PiComponentConfig } from "../configType";
import { PiFileList } from '../view/PiFileList';
import { fs2 } from '../tools/file';


export abstract class PiRenderer {
    private static _templates: { [name: string]: string } = {};
    protected files: PiFileList;

    constructor(
        protected caption: string,
        protected proj: PiProjectConfig,
        protected cfg: PiComponentConfig,
        private _renderIndex: boolean
    ) {
        this.files = new PiFileList(cfg, '');
    }

    async render() {
        console.log('  rendering ' + this.caption + ' files...')
        if (this.cfg.beforeAll == 'skip') {
            console.log('    skipped.')
            return;
        }

        if (this.cfg.beforeAll == 'clean')
            fs2.cleanDir(this.cfg.dir);

        await this.populateFiles();
        this.files.files.forEach(f => {
            if (this.cfg.beforeAll == 'clean' || this.cfg.overwrite || !fs.existsSync(f.fileName)) {
                let view = f.prepareView();
                this._renderFile(f.fileName, f.mustache, view);
            }
        });
        if (this._renderIndex)
            this._writeIndex();
    }

    /** Writes the index.ts on the directory with all the files as view */
    private _writeIndex() {
        let templ = this.cfg.mustache!.index!;
        this._renderFile(path.join(this.cfg.dir, 'index.ts'), templ, this.files);
    }

    /** Reads the template from file, caches it, and run mustache to write it to the out file */
    private _renderFile(outFile: string, templFile: string, view: any) {
        // if (config.debug)
        //     fs.writeFileSync(
        //         '/tmp/picodegen/' + path.basename(path.dirname(outFile)) + '-' + new Date().toISOString() + '.json',
        //         JSON.stringify(view, null, 4), 'utf8');
        let template = PiRenderer._templates[templFile];
        if (!template) {
            template = fs.readFileSync(templFile, 'utf8');
            PiRenderer._templates[templFile] = template;
        }
        let content = Mustache.render(template, view);
        fs2.mkdirp(path.dirname(outFile));
        fs.writeFileSync(outFile, content.trim().replace(/\n{3}/g, '\n\n'), 'utf8');
    }

    /** Fills the PiRenderer.files property with the files that will be rendered */
    protected abstract populateFiles(): Promise<void>;
}