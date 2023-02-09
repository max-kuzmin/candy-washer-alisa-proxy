export interface StateReqAlisa {
    devices: Device[];
}

export interface Device {
    id:           string;
    custom_data?: object;
}