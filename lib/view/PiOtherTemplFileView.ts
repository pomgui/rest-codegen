import path from 'path';
import { PiProjectConfig, PiFileConfig, PiComponentConfig } from "../configType";
import { PiFileView } from "./PiFileView";
import { file, name, config } from "../config";

const pck = require('../../package.json');

/** View structure for all proj.other files */
interface PiView {
    picodegen: { version: string };
    /** Services generated files directory (or alias if it exists) */
    service: { dir: string };
    /** Some OpenApi attributes */
    openapi: {
        name: string;
        version: string;
        description: string;
        basePath: string;
        author: string | {
            name?: string,
            email?: string,
            url?: string
        }
    };
    /** All the options defined by the user in proj.other */
    cfg: PiProjectConfig;
    configFile: string;
}

/**
 * View used by any of the mustache template files that are not parameter, model, nor service.
 * Ex. package.json, tsconfig.json, main ts modules, etc.
 */
export class PiOtherTemplFileView extends PiFileView {
    private static _openapi: any;

    /**
     * 
     * @param proj  Project Configuration
     * @param fileName relative path from template root dir
     * @param templFile 
     */
    constructor(
        proj: PiProjectConfig,
        public fileName: string,
        templFile: string
    ) {
        super(proj, Object.assign(
            <PiComponentConfig>{ beforeAll: 'none', file, name },
            proj.other
        ));
        this.mustache = templFile;
    }

    prepareView(): object {
        let info = config.yaml.info || {};
        let openapi = PiOtherTemplFileView._openapi ||
            (PiOtherTemplFileView._openapi = {
                basePath: config.yaml.basePath,
                name: packageName(),
                version: info.version || '1.0.0',
                description: info.description || 'picodegen generated project',
                author: JSON.stringify(info.contact || '')
            });
        let dirname = path.relative(path.dirname(this.fileName), this.proj.services.dir);
        if (!dirname.startsWith('.'))
            dirname = './' + dirname;
        return <PiView>{
            picodegen: { version: pck.version },
            cfg: this.proj,
            configFile: config.configFile,
            openapi,
            service: {
                dir: this.proj.services.dirAlias || dirname
            }
        };
    }
}

function packageName(): string {
    return config.yaml.info && config.yaml.info.title
        && (<string>config.yaml.info.title).replace(/\s+/g, "-").toLowerCase()
        || 'pirest-codegen-project';
}
