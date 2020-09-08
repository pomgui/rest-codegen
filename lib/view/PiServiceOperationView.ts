import { PiField } from '@pomgui/rest-lib';

export interface PiServiceOperationView {
    /** get, put, post, etc. */
    httpMethod: string;
    /** GET, PUT, POST, etc. */
    httpMETHOD: string;
    uri: string;
    comment?: string;
    name: string;
    /** Type for all parameters (path+query+body+header) */
    allParamsType: string;
    /** list of parameters: path and body parameters are listed individually, query and header parameters are related to a Type */
    parameters?: PiField[];
    /** pirest.PiApiCaller parameter to replace in the mustache "as is" */
    apiParams?: string,
    extraParam: boolean;
    returnType: string;
    returnsVoid?: boolean;
    returnObj: string;
    errors: PiServiceOperationErrorView[];
    security?: string;
}

export interface PiServiceOperationErrorView {
    message: string;
    status: number;
}


