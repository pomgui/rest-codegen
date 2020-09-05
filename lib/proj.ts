import { config } from "./config";
import * as tools from './tools';
import * as fs from 'fs';
import * as path from 'path';

export function writeProjFiles(): void {
    fs.readdirSync(config.template)
        .forEach(copyFile);
}

function copyFile(file: string): void {
    const outFile = path.join(config.outDir, file);
    if (fs.existsSync(outFile)) {
        if (['package.json', 'tsconfig.json'].includes(file)) {
            console.warn('warn: ' + file + ': already exists, skipped.');
            return;
        } else
            console.warn('warn: ' + file + ': will be overwritten.');
    }
    let content = fs.readFileSync(path.join(config.template, file), 'utf8');
    let info = config.yaml.info;
    content = content.replace(/\{\{(.*)\}\}/g, (g, g1) => {
        switch (g1.trim()) {
            case 'project-version': return info.version || '1.0.0';
            case 'project-name': return info.title.replace(/\s+/g, "-") || 'pomguirest-openapi-project';
            case 'project-description': return info.description || 'Generated project';
            case 'base-path': return config.yaml.basePath;
            case 'src-dir': return path.basename(config.srcDir);
        }
    });
    fs.writeFileSync(outFile, content, 'utf8');
}