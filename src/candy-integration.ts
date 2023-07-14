import { CandyClient } from "./services/candy-client";
import { HandlerForIntegration, HandlerForIntegrationResult } from "./models/alisa/handler-models";
import { SendStateReqAlisa } from "./models/alisa/send-state-req-alisa";
import { StateReqAlisa } from "./models/alisa/state-req-alisa";

export async function handler(event: HandlerForIntegration): Promise<HandlerForIntegrationResult> {
    const reqId = event.headers?.request_id;
    const token = event.headers?.authorization;
    if (!event.request_type || !reqId || !token)
        throw new Error();

    if (event.request_type === "discovery") {
        const client = new CandyClient(token, reqId);
        return await client.getDevices();
    }

    if (event.request_type === "query" && event.payload) {
        const reqBody = event.payload as StateReqAlisa;
        const client = new CandyClient(token, reqId);
        return await client.getState(reqBody);
    }

    if (event.request_type === "action" && event.payload) {
        const reqBody = event.payload as SendStateReqAlisa;
        const client = new CandyClient(token, reqId);
        return await client.sendState(reqBody);
    }

    return {
        request_id: reqId
    };
};
