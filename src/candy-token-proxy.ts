import { HandlerInput, HandlerResult, splitXFormBody, fetchXForm } from 'mk-alisa-proxy-base';
import { ClientAppId, CandyTokenUrl } from './models/consts';

export async function handler(event: HandlerInput): Promise<HandlerResult> {
    if (!event.body)
        return {
            statusCode: 400
        };

    const bodySplitted = splitXFormBody(event.body);
    const refreshToken = bodySplitted.get("refresh_token") ?? bodySplitted.get("code");

    if (!refreshToken)
        return {
            statusCode: 400
        };

    const tokenForm = {
        "grant_type": "refresh_token",
        "client_id": ClientAppId,
        "refresh_token": refreshToken
    };
    const tokenResponse = await fetchXForm(tokenForm, CandyTokenUrl);
    const tokenBody = await tokenResponse.text();
    const tokenBodyJson = JSON.parse(tokenBody);
    const token = tokenBodyJson.id_token;
    
    return {
        statusCode: 200,
        body: {
            "access_token": token,
            "refresh_token": refreshToken,
            "token_type": "Bearer",
            "expires_in": 28800 - 60 // 8 часов
          }
    };
    
};