#!/usr/bin/env node
import { config, prepareConfig } from './config';
import Mustache from 'mustache';
import { PiProjectRenderer } from './render/PiProjectRenderer';

main();

function main() {
    Mustache.escape = v => v;

    prepareConfig();

    config.projects
        .map(cfg => new PiProjectRenderer(cfg))
        .forEach(proj => proj.render());

    console.log('done.');
}