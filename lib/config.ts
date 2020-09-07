import * as jsyaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { PiConfig, PiComponentConfig, PiProjectConfig } from './configType';
import { misc } from './tools/misc';
import { fs2 } from './tools/file';
import { str } from './tools/string';

type _PiArgs = { configFile: string, projects: string[], debug: boolean };

class _PiConfig implements PiConfig {
    file = '';
    projects = [] as PiProjectConfig[];
    debug = false;
    yaml: any;
    configFile = '';

    constructor(args: _PiArgs) { this._init(args); }

    private _init(args: _PiArgs) {
        let file = require(args.configFile);
        misc.copy(this, file);
        this.debug = args.debug;
        this.configFile = args.configFile;
        this._loadOpenapiSpec();
        this._selectProjects(args.projects);
        this._prepareDirs();
        if (!this.debug)
            console.debug = () => { }
    }

    private _selectProjects(projects: string[]) {
        let all = !projects.length;
        if (!all) {
            projects.some(name => assert(
                this.projects.find(prj => prj.name == name),
                `Project '${name}' not found in configuration file`
            ));
            this.projects = this.projects.filter(prj => projects.includes(prj.name));
        }
        assert(this.projects.length, 'No projects to be processed.');
        this.projects.forEach(prj => {
            if (prj.databasePool) {
                // To be used as: 'Pi{{type}}Database'
                if (prj.databasePool.type == 'mysql')
                    prj.databasePool.type = 'MySql' as any;
                else
                    prj.databasePool.type = 'Firebird' as any;
                // The options as a string
                prj.databasePool.options = JSON.stringify(prj.databasePool.options, null, 2)
                    .replace(/"([^"]+)":/g, '$1:').replace(/"/g, '\'');
            }
        });
    }

    private _loadOpenapiSpec() {
        const me = this;
        assert(this.file, 'OpenApi file not specified');
        this.yaml = jsyaml.load(fs.readFileSync(this.file, 'utf8'));
        assert(this.yaml.swagger == '2.0', `File '${path.basename(this.file)}' MUST be version 2.0!`);

        // Normalize yaml
        const paramsOf = (obj: any) => 'parameters' in obj ? obj.parameters : [];

        // name is an attribute of each parameter, so in order to share code with definitions, let's add it
        Object.entries(this.yaml.definitions)
            .forEach(([name, def]: [string, any]) => def.name = name);

        // method (get, put, patch, etc.) and uri will be needed in the operations code, so let's add'em
        Object.entries(this.yaml.paths)
            .forEach(([$$uri, path]: [string, any]) => {
                Object.entries(path)
                    .filter(([$$method, operation]: [string, any]) => ['get', 'post', 'delete', 'put', 'patch', 'option'].includes($$method))
                    .forEach(([$$method, operation]: [string, any]) => {
                        operation.$$method = $$method.toUpperCase();
                        operation.$$uri = $$uri;
                        // also, parameters in the path level will be concatened to the operation level
                        operation.parameters = [...paramsOf(path), ...paramsOf(operation)];
                        // and all the $refs will be replaced by their real definitions
                        operation.parameters.forEach((p: any, i: number) => '$ref' in p && (operation.parameters[i] = replaceRef(p.$ref)));
                    })
            });
        return;

        function replaceRef(ref: string): object {
            if (!ref.startsWith('#/')) {
                console.error('$ref: "' + ref + '" invalid!');
                process.exit(1);
            }
            let r = ref.split('/'), o = me.yaml;
            for (let i = 1; i < r.length; i++) {
                o = o[r[i]];
            }
            return o;
        }
    }

    private _prepareDirs() {
        Object.values(this.projects).forEach(proj => {
            ensureDir(proj, '.');
            normalizeSection(proj, proj.services, proj.dir, 'service');
            normalizeSection(proj, proj.model, proj.dir, 'type');
            normalizeSection(proj, proj.params, proj.dir, 'type');
            if (!proj.other.mustache) proj.other.mustache = {};
            if (!proj.other.mustache!.dir) proj.other.mustache.dir =
                path.join(__dirname, '..', 'templates', proj.type);
        });
        return;

        function normalizeSection(proj: PiProjectConfig, cfg: PiComponentConfig, root: string, dfltTempl?: string): void {
            ensureDir(cfg, root);
            if (root != '.') {
                if (!cfg.mustache) cfg.mustache = {};
                if (!cfg.mustache.file)
                    cfg.mustache.file = path.join(__dirname, '../templates', proj.type, dfltTempl + '%.ts');
                if (!cfg.mustache.index)
                    cfg.mustache.index = path.join(__dirname, '../templates', proj.type, dfltTempl + '-index%.ts');
                cfg.file = file;
                cfg.name = name;
            }
        }

        function ensureDir(cfg: { dir: string }, root: string) {
            if (!path.isAbsolute(cfg.dir))
                cfg.dir = path.join(root, cfg.dir);
            fs2.mkdirp(cfg.dir);
        }
    }


}

export function file(this: PiComponentConfig, name: string, ext: string): string {
    return path.join(this.dir, this.name(name) + ext);
}

export function name(this: PiComponentConfig, name: string) {
    return (this.prefix || '') + str.camelCase(name) + (this.suffix || '')
}

export var config: _PiConfig;

export function loadConfigFiles() {
    config = new _PiConfig(parseArgs());
}

function parseArgs(): _PiArgs {
    let configFile = '',
        projects = [] as string[],
        debug = false;
    const argv = process.argv;
    for (let i = 2; i < argv.length; i++) {
        let arg: any = argv[i].split('=');
        let param;
        if (arg.length == 2) param = arg[1];
        arg = arg[0];

        switch (arg) {
            case '--version':
                const pck = require(__dirname + '../../package.json');
                console.log(pck.version);
                process.exit(0);
            case '--config':
                configFile = param || argv[++i] as any; break;
            case '--debug':
                debug = true; break;
            default:
                if (arg.startsWith('-')) printUsage(arg);
                projects.push(arg);
        }
    }
    return { configFile, projects, debug };
}

function printUsage(arg?: string) {
    const options = {
        version: 'Show the version of the tool',
        config: 'Configuration file',
        debug: 'Print detailed messages for debug purposes'
    }

    let usage = Object.entries(options)
        .map(([option, data]) => `--${option}`.padEnd(10) + data[2])
        .join('\n');
    if (arg)
        console.log('Invalid option: "' + arg + '"');
    console.log('Usage:');
    console.log('  restcodegen [options] openapiSpec.yaml')
    console.log('Options:');
    console.log(usage);
    process.exit(1);
}

function assert(condition: any, message: string) {
    if (!condition) {
        console.error(message);
        process.exit(2);
    }
}