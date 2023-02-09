import fetch from "node-fetch";
import { fetchXForm } from "./helpers/fetch-x-form";
import { AuthHost, CandyAppRedirectUrl, CandyAuthUrl, CandyLoginUrl, ClientAppId, ScopeString } from "./models/consts";
import { HandlerInput, HandlerResult } from "./models/alysa/handler-models";
import { splitXFormBody } from "./helpers/split-body";

export async function handler(event: HandlerInput): Promise<HandlerResult> {
    //console.log(JSON.stringify(event));

    if (event.httpMethod === "GET") {
        if (!event.queryStringParameters?.state)
            return {
                statusCode: 400
            };

        return {
            statusCode: 200,
            body: `<html>
            <body>
                <form>
                    <input type="text" placeholder="Login" name="login">
                    <input type="password" placeholder="Password" name="password">
                    <input type="hidden" name="state" value="${event.queryStringParameters.state}">
                    <input type="submit" formmethod="post">
                </form>
            </body>
            </html>`
        };
    }

    const bodySplitted = splitXFormBody(event.body);
    const state = bodySplitted.get("state");
    const login = bodySplitted.get("login");
    const password = bodySplitted.get("password");
    
    const authResponse = await fetch(CandyAuthUrl
        + '?response_type=token'
        + '&client_id=' + ClientAppId
        + '&scope=' + ScopeString
        + '&redirect_uri=' + CandyAppRedirectUrl, { });
    const authBody = await authResponse.text();
    const redirectAfterLoginUrl = authBody.match(/setup%2Fsecur.+?'/)[0].replace(/.$/, "");
    //console.log(redirectAfterLoginUrl);

    const loginForm = {
        'un': login,
        'startURL': redirectAfterLoginUrl,
        'pw': password
    };
    const frontdoorResponse = await fetchXForm(loginForm, CandyLoginUrl);
    const frontdoorBody = await frontdoorResponse.text();
    const progressiveLoginUrl = frontdoorBody.match(/https:\/\/he-accounts.force.com.+?"/)[0].replace(/.$/, "");
    //console.log(progressiveLoginUrl);

    const frontdoorSetCookies = frontdoorResponse.headers.get("Set-Cookie");
    const sid = frontdoorSetCookies.match(/sid=.+?;/)[0].replace(/.$/, "");
    //console.log(sid);

    const progressiveLoginResponse = await fetch(progressiveLoginUrl, { headers: {
        'Cookie': sid
      }});
    const progressiveLoginBody = await progressiveLoginResponse.text();
    const remoteAccessAuthUrl = progressiveLoginBody.match(/\/CandyApp.+?'/)[0].replace(/.$/, "");
    //console.log(remoteAccessAuthUrl);

    const remoteAccessAuthResponse = await fetch(AuthHost + remoteAccessAuthUrl, { headers: {
        'Cookie': sid
      }});
    const remoteAccessAuthBody = await remoteAccessAuthResponse.text();
    const refreshToken = remoteAccessAuthBody.match(/refresh_token=.+?&/)[0].replace(/^.{14}/, "").replace(/.$/, "");
    //console.log(refreshToken);

    const resultUrl = `https://social.yandex.net/broker/redirect`
    + `?code=${refreshToken}`
    + `&state=${state}`
    + `&client_id=` + ClientAppId
    + `&scope=` + ScopeString;

    return {
        statusCode: 200,
        body: `<html><body><a href=${resultUrl}>Click to complete</a></body></html>`
    };
    
};
