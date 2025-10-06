export interface Completion {
    label: string;
    type: string;
    detail?: string;
    info?: string;
}

export const rootCompletionLabels: readonly string[] = [
    'openapi',
    'info',
    'externalDocs',
    'servers',
    'paths',
    'components',
    'tags',
    'security',
];

export const infoCompletionLabels: readonly string[] = [
    'title',
    'version',
    'description',
    'termsOfService',
    'contact',
    'license',
];

export const contactCompletionLabels: readonly string[] = [
    'name',
    'url',
    'email',
];

export const licenseCompletionLabels: readonly string[] = ['name', 'url'];

export const serversCompletionLabels: readonly string[] = [
    'url',
    'description',
];
export const methodCompletionLabels: readonly string[] = [
    'get',
    'post',
    'put',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
];
export const operationCompletionLabels: readonly string[] = [
    'summary',
    'description',
    'operationId',
    'parameters',
    'requestBody',
    'responses',
    'tags',
    'security',
];

export const httpStatusCodesLabels: readonly string[] = [
    '100',
    '101',
    '102',
    '103',
    '200',
    '201',
    '202',
    '203',
    '204',
    '205',
    '206',
    '207',
    '208',
    '226',
    '300',
    '301',
    '302',
    '303',
    '304',
    '305',
    '306',
    '307',
    '308',
    '400',
    '401',
    '402',
    '403',
    '404',
    '405',
    '406',
    '407',
    '408',
    '409',
    '410',
    '411',
    '412',
    '413',
    '414',
    '415',
    '416',
    '417',
    '418',
    '421',
    '422',
    '423',
    '424',
    '425',
    '426',
    '428',
    '429',
    '431',
    '451',
    '500',
    '501',
    '502',
    '503',
    '504',
    '505',
    '506',
    '507',
    '508',
    '510',
    '511',
];
export const responseCompletionLabels: readonly string[] = [
    'description',
    'content',
];

export const requestBodyCompletionLabels: readonly string[] = [
    'description',
    'content',
    'required',
];
export const parameterCompletionLabels: readonly string[] = [
    'name',
    'in',
    'description',
    'required',
    'schema',
];

export const componentsCompletionLabels: readonly string[] = [
    'schemas',
    'responses',
    'parameters',
    'requestBodies',
    'securitySchemes',
];

export const tagsCompletionLabels: readonly string[] = [
    'name',
    'description',
    'externalDocs',
];

export const externalDocCompletionLabels: readonly string[] = [
    'description',
    'url',
];

export function prepareCompletion(completion: readonly string[]): {
    label: string;
    type: string;
}[] {
    return completion.map((value): { label: string; type: string } => ({
        label: value,
        type: 'property',
    }));
}

export const completionMap: Map<string, Completion[]> = new Map<
    string,
    Completion[]
>([
    ['info', prepareCompletion(infoCompletionLabels)],
    ['servers', prepareCompletion(serversCompletionLabels)],
    ['components', prepareCompletion(componentsCompletionLabels)],
    ['tags', prepareCompletion(tagsCompletionLabels)],
    ['contact', prepareCompletion(contactCompletionLabels)],
    ['license', prepareCompletion(licenseCompletionLabels)],
    ['parameters', prepareCompletion(parameterCompletionLabels)],
    ['requestBody', prepareCompletion(requestBodyCompletionLabels)],
    ['externalDocs', prepareCompletion(externalDocCompletionLabels)],
    ['responses', prepareCompletion(httpStatusCodesLabels)],
]);
