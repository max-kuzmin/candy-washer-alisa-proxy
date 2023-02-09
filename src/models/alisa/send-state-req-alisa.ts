import { AlisaModes, CapabilitiesInstances, CapabilitiesTypes } from "../consts";

export interface SendStateReqAlisa {
    payload: Payload;
}

export interface Payload {
    devices: Device[];
}

export interface Device {
    id: string;
    custom_data?: object;
    capabilities: Capability[];
}

export interface Capability {
    type: CapabilitiesTypes;
    state: State;
}

export interface State {
    instance: CapabilitiesInstances;
    value: boolean | AlisaModes;
}