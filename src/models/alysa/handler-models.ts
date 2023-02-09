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