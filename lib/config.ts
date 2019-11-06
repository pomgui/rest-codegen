import * as jsyaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import arg from 'arg';
import { PiConfig, PiFileConfig, PiComponentConfig, PiProjectConfig, PiServiceConfig } from './configType';
import { misc } from './tools/misc';
import { fs2 } from './tools/file';
import { str } from './tools/string';

const options = {
    version: [Boolean, 'v', 'Show the version of the tool', false],
    config: [String, 'c', 'Configuration file containing all the options', false],
    file: [String, 'f', 'OpenApi/Swagger 2.0 file'],
    debug: [Boolean, 'd', 'Print detailed messages for debug purposes']
}

export const config: PiConfig = {
    file: '',
    projects: [
        {
            type: 'express',
            dir: '.',
            model: { dir: 'app/model', beforeAll: 'clean', file, name },
            params: { dir: 'app/model/params', beforeAll: 'clean', file, name },
            service: { dir: 'app/service', beforeAll: 'clean', file, name },
            other: { dir: '.', overwrite: true }
        }
    ],
    yaml: {}
};

export function prepareConfig(): void {
    let args: any;
    let cfg = config;
    try {
        args = parseArgs();
    } catch (e) {
        console.error(e.message);
        printUsage();
    }
    if (args['--version']) {
        console.log('0.0.1');
        process.exit(0);
    }
    if (args['--config']) {
        let file = JSON.parse(fs.readFileSync(args['--config'], 'utf8'));
        misc.copy(cfg, file);
    }

    if (!cfg.file && args._.length != 1) {
        console.error('OpenApi file not specified');
        printUsage();
    } else if (!cfg.file)
        cfg.file = args._[0];

    cfg.projects.forEach(proj => {
        ensureDir(proj, '.');
        normalize(proj, proj.service, proj.dir, 'service');
        normalize(proj, proj.model, proj.dir, 'type');
        normalize(proj, proj.params, proj.dir, 'type');
        if (!proj.other.mustache) proj.other.mustache = {};
        if (!proj.other.mustache!.dir) proj.other.mustache.dir =
            path.join(__dirname, '..', 'templates', proj.type);
    });

    cfg.yaml = jsyaml.load(fs.readFileSync(cfg.file, 'utf8'));
    if (cfg.yaml.swagger != '2.0') {
        console.error(`File '${path.basename(cfg.file)}' MUST be version 2.0!`)
    }
    normalizeYaml();
    configConsole();
}

function normalize(proj: PiProjectConfig, cfg: PiComponentConfig, root: string, dfltTempl?: string): void {
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

function parseArgs(): any {
    let spec: any = {};
    Object.entries(options)
        .forEach(([option, data]) => {
            spec['--' + option] = data[0];
            if (data[1]) spec['-' + data[1]] = '--' + option;
        })
    let args = arg(spec);
    Object.entries(args)
        .filter(([option, value]) => option != '_' && (<any>options)[option.substr(2)][3] !== false)
        .forEach(([option, value]) => {
            let obj = <any>config;
            let parts = option.substr(2).split('.');
            let part = '';
            for (let i = 0; (part = parts[i]) && i < parts.length - 1; i++) {
                if (!obj[part]) obj[part] = {};
                obj = obj[part];
            }
            obj[part] = value;
        });
    return args;
}

function printUsage() {
    let maxlen = Math.max(...Object.entries(options)
        .map(([option, data]: [string, any]) => option.length + data[1].length + 3)) + 1;
    let usage = Object.entries(options)
        .map(([long, [type, short, desc]]) => ['--' + long, short ? ', -' + short : '', desc])
        .map(([long, short, desc]) => str.rpad(<string>long + <string>short, maxlen) + desc)
        .join('\n');
    console.log('Usage:');
    console.log('  picodegen [options] openapiSpec.yaml')
    console.log('Options:');
    console.log(usage);
    process.exit(1);
}

function configConsole() {
    if (!config.debug)
        console.debug = () => { }
}

function normalizeYaml() {
    const paramsOf = (obj: any) => 'parameters' in obj ? obj.parameters : [];

    // name is an attribute of each parameter, so in order to share code with definitions, let's add it
    Object.entries(config.yaml.definitions)
        .forEach(([name, def]: [string, any]) => def.name = name);

    // method (get, put, patch, etc.) and uri will be needed in the operations code, so let's add'em
    Object.entries(config.yaml.paths)
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
        })
}

function replaceRef(ref: string): object {
    if (!ref.startsWith('#/')) {
        console.error('$ref: "' + ref + '" invalid!');
        process.exit(1);
    }
    let r = ref.split('/'), o = config.yaml;
    for (let i = 1; i < r.length; i++) {
        o = o[r[i]];
    }
    return o;
}

export function file(this: PiComponentConfig, name: string, ext: string): string {
    return path.join(this.dir, this.name(name) + ext);
}

export function name(this: PiComponentConfig, name: string) {
    return (this.prefix || '') + str.camelCase(name) + (this.suffix || '')
}