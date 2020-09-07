#!/usr/bin/env node
import { config, loadConfigFiles } from './config';
import Mustache from 'mustache';
import { PiProjectRenderer } from './render/PiProjectRenderer';

main();

function main() {
    try {
        Mustache.escape = v => v;
        loadConfigFiles();

        config.projects
            .map(cfg => new PiProjectRenderer(cfg))
            .forEach(proj => proj.render());

        console.log('done.');
    } catch (err) {
        if (process.argv.includes('--debug')) console.trace(err);
        else console.error(err.message);
        process.exit(2);
    }
}