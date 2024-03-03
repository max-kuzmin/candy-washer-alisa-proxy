import { HandlerForIntegration, HandlerForIntegrationResult, alisaHandlerBase } from 'mk-alisa-proxy-base';
import { CandyClient } from './services/candy-client';

export function handler(event: HandlerForIntegration): Promise<HandlerForIntegrationResult> {
    const token = event.headers?.authorization;
    if (!token)
        throw new Error();

    return alisaHandlerBase(event, reqId => new CandyClient(token, reqId));
};
