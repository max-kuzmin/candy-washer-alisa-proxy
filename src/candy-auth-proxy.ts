import { HandlerInput, HandlerResult, splitXFormBody, fetchXForm, HttpMethod } from 'mk-alisa-proxy-base';
import { CandyAuthUrl, ClientAppId, ScopeString, CandyAppRedirectUrl, CandyLoginUrl, ProgressiveLoginRegex, OauthAppName, AuthHost } from './models/consts';

export async function handler(event: HandlerInput): Promise<HandlerResult> {
    if (event.httpMethod === HttpMethod.Get) {
        if (!event.queryStringParameters["state"])
            return {
                statusCode: 400
            };

        return loginPage(event);
    }

    if (!event.body)
            return {
                statusCode: 400
            };

    const bodySplitted = splitXFormBody(event.body);
    const state = bodySplitted.get("state")!;
    const login = bodySplitted.get("login")!;
    const password = bodySplitted.get("password")!;
    
    try {
        const authResponse = await fetch(CandyAuthUrl
            + "?response_type=token"
            + "&client_id=" + ClientAppId
            + "&scope=" + ScopeString
            + "&redirect_uri=" + CandyAppRedirectUrl, { });
        const authBody = await authResponse.text();

        const redirectAfterLoginUrl = authBody.match(/setup%2Fsecur.+?'/)![0].replace(/.$/, "")!;

        const loginForm = {
            "un": login,
            "startURL": redirectAfterLoginUrl,
            "pw": password
        };
        const frontdoorResponse = await fetchXForm(loginForm, CandyLoginUrl);
        const frontdoorBody = await frontdoorResponse.text();

        const progressiveLoginUrl = frontdoorBody.match(ProgressiveLoginRegex)![0].replace(/.$/, "");
        const frontdoorSetCookies = frontdoorResponse.headers.get("Set-Cookie");
        const sid = frontdoorSetCookies!.match(/sid=.+?;/)![0].replace(/.$/, "");
        const progressiveLoginResponse = await fetch(progressiveLoginUrl, { headers: {
            "Cookie": sid
        }});
        const progressiveLoginBody = await progressiveLoginResponse.text();

        const remoteAccessAuthUrl = progressiveLoginBody.match(new RegExp(`\/${OauthAppName}.+?'`))![0].replace(/.$/, "");
        const remoteAccessAuthResponse = await fetch(AuthHost + remoteAccessAuthUrl, { headers: {
            "Cookie": sid
        }});
        const remoteAccessAuthBody = await remoteAccessAuthResponse.text();

        const refreshToken = remoteAccessAuthBody.match(/refresh_token=.+?&/)![0].replace(/^.{14}/, "").replace(/.$/, "");
        const resultUrl = `https://social.yandex.net/broker/redirect`
        + `?code=${refreshToken}`
        + `&state=${state}`
        + `&client_id=` + ClientAppId
        + `&scope=` + ScopeString;

        return {
            statusCode: 302,
            headers: {
                Location: resultUrl
            }
        };
    } catch (e) {
        console.log(e);
        return loginPage(event, true);
    }
};


function loginPage(event: HandlerInput, wrongPassword = false): HandlerResult | PromiseLike<HandlerResult> {
    return {
        statusCode: 200,
        body: `<html>
            <body>
                <form style="display: flex; flex-direction: column; align-items: center; gap: 1rem; top: 25%; position: relative;">
                    <input type="text" placeholder="E-mail" name="login" style="font-size: 32pt;">
                    <input type="password" placeholder="Пароль" name="password" style="font-size: 32pt;">
                    ${wrongPassword ? "<div>Неправильный пароль</div>" : ""}
                    <input type="hidden" name="state" value="${event.queryStringParameters["state"]}">
                    <input type="submit" formmethod="post" value="Войти" style="font-size: 32pt; padding: 8px 100px;">
                </form>
            </body>
            </html>`
    };
}
