export interface HandlerInput {
    path: string;
    headers: { [key: string]: string };
    queryStringParameters: { [key: string]: string };
    body: string | undefined;
    httpMethod: "GET" | "POST";
}

export interface HandlerResult {
    statusCode: number,
    body?: object | string
}

export interface HandlerForIntegration {
    headers: HeadersForIntegration;
    request_type: "action" | "unlink" | "query" | "discovery";
    payload?: object | undefined;
}

export interface HeadersForIntegration {
    authorization: string;
    request_id: string;
}

export interface HandlerForIntegrationResult {
    request_id: string;
    payload?: object | undefined;
}