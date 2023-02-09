import { CandyClient } from "./candy-client";
import { HandlerInput, HandlerResult } from "./models/alisa/handler-models";
import { SendStateReqAlisa } from "./models/alisa/send-state-req-alisa";
import { StateReqAlisa } from "./models/alisa/state-req-alisa";

export async function handler(event: HandlerInput): Promise<HandlerResult> {
    //console.log(JSON.stringify(event));
    //console.log(event.path);

    if (!event.path)
        return {
            statusCode: 400
        };

    if (event.path === "/v1.0") {
        return {
            statusCode: 200
        };
    }

    if (event.path === "/v1.0/user/unlink") {
        return {
            statusCode: 200,
            body: {
                request_id: Date.now().toString()
            }
        };
    }

    const token = event.headers.Authorization;
    const client = new CandyClient(token, "TODO");
    if (event.path === "/v1.0/user/devices") {
        return {
            statusCode: 200,
            body: await client.getDevices()
        };
    }

    if (event.path === "/v1.0/user/devices/query") {
        const reqBody: StateReqAlisa = JSON.parse(event.body);
        return {
            statusCode: 200,
            body: await client.getState(reqBody)
        };
    }

    if (event.path === "/v1.0/user/devices/action") {
        const reqBody: SendStateReqAlisa = JSON.parse(event.body);
        return {
            statusCode: 200,
            body: await client.sendState(reqBody)
        };
    }

    return {
        statusCode: 404
    };
};
