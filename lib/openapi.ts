import * as fs from 'fs';
import * as path from 'path';
import * as defs from './definitions';
import * as paths from './paths';
import { config, processArgs } from './config';
import * as params from './parameters';
import * as proj from './proj';

main();

function main() {
    processArgs();

    console.log('writing model...');
    defs.writeModel(config.yaml.definitions);

    console.log('writing parameters...');
    params.writeParamFiles(config.yaml.paths);

    console.log('writing operations...');
    paths.writeApiFiles(config.yaml.paths);

    console.log('writing other structure files...');
    proj.writeProjFiles();

    console.log('done.');
}

function writeModelIndex() {
    let code =
        fs.readdirSync(config.modelDir)
            .map(f => `export * from './${f.replace(/\.[^.]+$/, '')}';`)
            .join('\n');
    fs.writeFileSync(path.join(config.modelDir, 'index.ts'), code, 'utf8');
}