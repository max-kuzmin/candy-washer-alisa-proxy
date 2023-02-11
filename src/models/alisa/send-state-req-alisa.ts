import { Capability } from "./state-res-alisa";

export interface SendStateReqAlisa {
    devices: DeviceFromSendState[];
}

export interface DeviceFromSendState {
    id: string;
    custom_data?: object;
    capabilities: Capability[];
}