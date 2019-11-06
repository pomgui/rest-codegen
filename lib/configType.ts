export interface PiFileName extends PiFileConfig {
    /** Internal use: Return full path (including path,prefix, and suffix) */
    file(name: string, ext: string): string;
    name(name: string): string;
}

/**
 * PiCodeGen configuration file
 */
export interface PiFileConfig {
    /** Directory where the file will be written. If it's relative, then it refers to #proj.dir */
    dir: string;

    /** Only used when #cleanDir==false. Existing file will be completely overwritten */
    overwrite?: boolean;

    /** Only used when #overwrite==false. Existing file will be updated (when possible) */
    update?: boolean;

    /** Templates for each file including index.ts (mustache syntax) */
    mustache?: {
        /** all ts files of this type (model, params, or service) */
        file?: string,
        /** index.ts for the main directory of this type (model, params, or service) */
        index?: string,
        /** 
         * Only for the helper files that need to be copied to make a complete project (ex. tsconfig.ts) 
         * The whole structure will be copied replacing the mustache template with the view @see PiAnyTemplateView
         * Default value: `/pi/pirest-codegen/template/${proj.type}`
        */
        dir?: string
    };
}

/** PiFileName methods are used internally */
export interface PiComponentConfig extends PiFileConfig, PiFileName {
    /** prefix to be added to all generated classes and files (ex. Dto) */
    prefix?: string;
    /** suffix to be added to all generated classes and files (ex. Params) */
    suffix?: string;
    /** The directory will be cleaned before the generation (removing all the files on it) */
    beforeAll: 'clean' | 'skip' | 'none';
    /** 
     * Alias used in the generated code instead of `dir` when dir is too confuse (Ex. @model)) 
     * This value should be written in the "path" section of tsconfig.json
     */
    dirAlias?: string;
}

export interface PiServiceConfig extends PiComponentConfig {
    /** Add extra parameter to each operation (db, req, res) */
    extraParam?: boolean;
}

export interface PiProjectConfig {
    /** Generated code will be 'express ' (server) or 'angular' (client) */
    type: 'express' | 'angular';
    /** Directory base for all generated code. */
    dir: string;
    /** All the yaml!/definitions will be written using this configuration */
    model: PiComponentConfig;
    /** All the operation's parameters will be written using this configuration */
    params: PiComponentConfig;
    /** 
     * All the operation's classes will be written using this configuration
     * .mustache_templates is an array of two files. Default: [service%.ts, index%.ts]  
     */
    service: PiServiceConfig;
    /** 
     * All files in the .dir will be recursively copied and assumed as mustache templates. 
     * If .dir is not defined, ~/templates/{{.type}} is used.
     * The files that have '%' in the name won't be considered.
     */
    other: PiFileConfig;
}

export interface PiConfig {
    /** Openapi 2.0 Yaml file */
    file: string;

    /** Specific general configuration */
    projects: PiProjectConfig[];

    /** Prints detailed messages (for debug purposes) */
    debug?: boolean;

    /** Internal use */
    yaml: any;
}