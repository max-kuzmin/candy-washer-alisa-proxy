import { CapabilitiesTypes, CapabilitiesInstances, AlysaModes } from "../consts";


export interface StateResAlisa {
    request_id: string;
    payload: StatePayload;
}

export interface StatePayload {
    devices: DeviceState[];
}

export interface DeviceState {
    id: string;
    capabilities?: Capability[];
    error_code?: string;
    error_message?: string;
}

export interface Capability {
    type: CapabilitiesTypes;
    state: State;
}

export interface State {
    instance: CapabilitiesInstances;
    value: boolean | AlysaModes;
}