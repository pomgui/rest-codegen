import * as jsyaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import arg from 'arg';
import * as tools from './tools';

const options = {
    'version': [Boolean, 'v', 'Show the version of the tool'],
    'client': [Boolean, 'c', 'Generates the typescript client version (angular)'],
    'server': [Boolean, 's', 'Generates the typescript server version (express)'],
    'include-extra-params': [Boolean, 'e', 'Each operation will receive extra parameters {db, req, res}'],
    'outDir': [String, 'o', 'Output directory (default ".")'],
    'template': [String, 't', 'Custom template directory']
}

var _config: { [i: string]: any } = {
    version: false,
    client: false,
    server: true,
    includeExtraParams: false,
    inFile: '',
    outDir: '.',
    yaml: <any>{}
};

export var config = _config;

export function processArgs(): void {
    let ensure = (d: string) => tools.mkdirp(d);
    let args: any;
    try {
        args = parseArgs();
    } catch (e) {
        console.error(e.message);
        printUsage();
    }
    if (config.version) {
        console.log('0.0.1');
        process.exit(0);
    }
    if (args._.length != 1) {
        console.error('OpenApi file not specified');
        printUsage();
    }

    _config.inFile = args._[0];
    _config.modelDir = path.join(_config.outDir, 'src/model');
    _config.serviceDir = path.join(_config.outDir, 'src/service');
    if (!_config.template)
        _config.template = path.join(__dirname, '..', 'templates', _config.server ? 'server' : 'client');

    ensure(_config.outDir);
    ensure(_config.modelDir);
    ensure(path.join(_config.modelDir, 'param'));
    ensure(_config.serviceDir);

    config.yaml = jsyaml.load(fs.readFileSync(config.inFile, 'utf8'));
}

function parseArgs(): any {
    let spec: any = {};
    Object.entries(options)
        .forEach(([option, data]) => {
            spec['--' + option] = data[0];
            spec['-' + data[1]] = '--' + option;
        })
    let args = arg(spec);
    Object.entries(args)
        .forEach(([option, value]) =>
            _config[option.substr(2).replace(/-(.)/g, (g, g1) => g1.toUpperCase())] = value
        );
    return args;
}

function printUsage() {
    let usage = Object.entries(options)
        .map(([option, data]) => `-${data[1]}, --${option}${' '.repeat(20)}`.substr(0, 27) + data[2])
        .join('\n');
    console.log('Usage:');
    console.log('  picodegen [options] openapiSpec.yaml')
    console.log('Options:');
    console.log(usage);
    process.exit(1);
}