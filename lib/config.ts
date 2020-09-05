import * as jsyaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as tools from './tools';

const options = {
    'version': [Boolean, 'v', 'Show the version of the tool'],
    'type': [String, 't', 'Type angular|express of the generated code (default: express)'],
    // 'include-extra-params': [Boolean, 'e', 'Each operation will receive extra parameters {db, req, res}'],
    'out': [String, 'o', 'Application root path (default ".")'],
    'src': [String, 's', 'Code output path relative to root (default "src")'],
    'custom': [String, 'c', 'Custom template path (overrides --type)']
}

export class PiConfig {
    version = false;
    codeType: 'angular' | 'express' = 'angular';
    outDir: string = '.';
    srcDir = 'src';
    modelDir = 'model';
    serviceDir = 'service';
    paramDir = 'model/param';
    template = path.join(__dirname, '..', 'templates', this.codeType);
    yaml: any = {};
    inFile: string = '';
    includeExtraParams = false;
}

export const config = new PiConfig();

export function processArgs(): void {
    const ensure = (d: string) => tools.mkdirp(d);
    parseArgs();
    config.modelDir = path.join(config.outDir, config.srcDir, config.modelDir);
    config.serviceDir = path.join(config.outDir, config.srcDir, config.serviceDir);
    config.paramDir = path.join(config.modelDir, config.paramDir);
    ensure(config.outDir);
    ensure(config.modelDir);
    ensure(config.paramDir);
    ensure(config.serviceDir);

    config.yaml = jsyaml.load(fs.readFileSync(config.inFile, 'utf8'));
}

function parseArgs(): void {
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
            case '--type':
                config.codeType = param || argv[++i] as any; break;
            case '--out':
                config.outDir = param || argv[++i]; break;
            case '--src':
                config.srcDir = param || argv[++i]; break;
            case '--custom':
                config.template = param || argv[++i]; break;
            default:
                if (arg.startsWith('-')) printUsage(arg);
                if (config.inFile) {
                    console.error('Only one openapi file is allowed.');
                    printUsage();
                }
                config.inFile = arg;
        }
    }
    if (!config.inFile) {
        console.error('Openapi file is required.');
        printUsage();
    }
}

function printUsage(arg?: string) {
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