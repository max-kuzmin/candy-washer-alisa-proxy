import { CapabilitiesTypes, CapabilitiesInstances } from "../consts";

export interface SendStateResAlisa {
    request_id: string;
    payload: Payload;
}

export interface Payload {
    devices: Device[];
}

export interface Device {
    id: string;
    capabilities?: SetCapabilityRes[];
    action_result?: DeviceActionResult;
}

export interface DeviceActionResult {
    status: string;
    error_code: string;
}

export interface SetCapabilityRes {
    type: CapabilitiesTypes;
    state: State;
}

export interface State {
    instance: CapabilitiesInstances;
    action_result: StateActionResult;
}

export interface StateActionResult {
    status: "DONE" | "ERROR";
    error_code?: string;
    error_message?: string;
}
