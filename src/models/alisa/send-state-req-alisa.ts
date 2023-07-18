import { Device, StateReqAlisa } from './state-req-alisa';
import { Capability } from "./state-res-alisa";

export interface SendStateReqAlisa extends StateReqAlisa {
    devices: DeviceFromSendState[];
}

export interface DeviceFromSendState extends Device {
    id: string;
    custom_data?: object;
    capabilities: Capability[];
}