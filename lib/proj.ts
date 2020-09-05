import { config } from "./config";
import * as tools from './tools';
import * as fs from 'fs';
import * as path from 'path';

export function writeProjFiles(): void {
    fs.readdirSync(config.template)
        .forEach(copyFile);
}

function copyFile(file: string): void {
    let content = fs.readFileSync(path.join(config.template, file), 'utf8');
    let info = config.yaml.info;
    content = content.replace(/\{\{(.*)\}\}/g, (g, g1) => {
        switch (g1.trim()) {
            case 'project-version': return info.version || '1.0.0';
            case 'project-name': return info.title.replace(/\s+/g, "-") || 'piservices-openapi-project';
            case 'project-description': return info.description || 'Generated project';
            case 'service-classes': return getServiceClasses().join(', ');
            case 'base-path': return config.yaml.basePath;
        }
    });
    fs.writeFileSync(path.join(config.outDir, file), content, 'utf8');
}

function getServiceClasses(): string[] {
    let classes: string[] = []
    Object.values(config.yaml.paths)
        .forEach((path: any) => Object.values(path).forEach((o: any) => o.tags && classes.push(o.tags[0])));
    return classes.filter(tools.distinct).map(c => tools.camelCase(c) + 'Api');
}