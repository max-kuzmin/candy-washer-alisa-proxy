import { AlysaModes, CapabilitiesInstances, CapabilitiesTypes } from "../consts";

export interface DevicesResAlisa {
    request_id: string;
    payload: DevicesPayload;
}

export interface DevicesPayload {
    user_id: string;
    devices: Device[];
}

export interface Device {
    id: string;
    name: string;
    description: string;
    room: string;
    type: "devices.types.washing_machine";
    custom_data: object;
    capabilities: DeviceCapability[];
    device_info: DeviceInfo;
}

export interface DeviceCapability {
    type: CapabilitiesTypes;
    retrievable: boolean;
    reportable: boolean;
    parameters: CapabilityParameters;
}

export interface CapabilityParameters {
    instance: CapabilitiesInstances;
    modes?: CapabilityMode[];
    unit?: string;
    range?: Range;
    color_model?: string;
    temperature_k?: Range;
}

export interface Range {
    min: number;
    max: number;
    precision: number;
}

export interface DeviceInfo {
    manufacturer: string;
    model: string;
    hw_version: string;
    sw_version: string;
}

export interface CapabilityMode {
    value: AlysaModes;
}
