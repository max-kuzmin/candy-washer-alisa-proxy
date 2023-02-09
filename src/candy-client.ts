import { DeviceResCandy } from "./models/candy/device-res-candy";
import { Device, DevicesResAlisa } from "./models/alisa/devices-res-alisa";
import fetch from "node-fetch";
import { DeviceState, StateResAlisa } from "./models/alisa/state-res-alisa";
import { StateReqAlisa } from "./models/alisa/state-req-alisa";
import { modeToComand, programCodeToMode } from "./helpers/mode-to-program-code";
import { SendStateReqAlisa } from "./models/alisa/send-state-req-alisa";
import { SendStateResAlisa } from "./models/alisa/send-state-res-alisa";
import { CommandReqCandy, PauseResumeCommandReqCandyBody, StartCommandReqCandyBody, StopCommandReqCandyBody } from "./models/candy/command-req-candy";
import { AlisaModes } from "./models/consts";

export class CandyClient {
    private readonly host = "https://simply-fi.herokuapp.com/api/v1/";
    private readonly getDevicesUrl = "appliances.json?with_programs=0";
    private readonly commandUrl = "commands.json";
    private readonly headers: object;
    private readonly headersForCommand: object;

    constructor(bearer: string,) {
        this.headers = {
            "Salesforce-Auth": 1,
            "Authorization": bearer
        };

        this.headersForCommand = {
            "Content-Type": "application/json",
            ...this.headers
        };
    }

    async getDevices(): Promise<DevicesResAlisa> {
        const response = await fetch(this.host + this.getDevicesUrl, { headers: this.headers });
        const devices: DeviceResCandy[] = await response.json();

        const result: DevicesResAlisa = {
            request_id: Date.now().toString(),
            payload: {
                user_id: "yandex",
                devices: []
            }
        };

        const filteredDevices = devices.filter(e => e.appliance.appliance_type === "washer_dryer");
        for (const device of filteredDevices) {
            const appliance = device.appliance;
            const mappedDevice: Device = {
                id: appliance.id,
                name: "Стиральная машина",
                description: "",
                type: "devices.types.washing_machine",
                custom_data: { },
                room: "",
                device_info: {
                    hw_version: "1.0",
                    manufacturer: "Candy",
                    sw_version: "1.0",
                    model: appliance.appliance_model
                },
                capabilities: [
                    {
                        type: "devices.capabilities.on_off",
                        reportable: true,
                        retrievable: true,
                        parameters: {
                            instance: "on"
                        }
                    },
                    {
                        type: "devices.capabilities.mode",
                        retrievable: true,
                        reportable: true,
                        parameters: {
                            instance: "program",
                            modes: [
                                {
                                    value: "dry" //только сушка 60 минут
                                },
                                {
                                    value: "express" // быстрая 30 минут без сушки
                                },
                                {
                                    value: "normal" // смешанная 60 минут с сушкой
                                },
                                {
                                    value: "eco" // смешанная 60 минут без сушки
                                },
                                {
                                    value: "auto" //режим, который задает пользователь за пределами алисы
                                }
                            ]
                        },
                    },
                    {
                        type: "devices.capabilities.toggle",
                        reportable: true,
                        retrievable: true,
                        parameters: {
                            instance: "pause"
                        }
                    }
                ]
            }

            result.payload.devices.push(mappedDevice);
        }

        return result;
    }

    async getState(alisaReq: StateReqAlisa): Promise<StateResAlisa> {
        const response = await fetch(this.host + this.getDevicesUrl, { headers: this.headers });
        const candyDevices: DeviceResCandy[] = await response.json();

        const result: StateResAlisa = {
            request_id: Date.now().toString(),
            payload: {
                devices: []
            }
        };

        for (const alisaDevice of alisaReq.devices) {
            const candyDevice = candyDevices.find(e => e.appliance.id === alisaDevice.id)?.appliance;

            const alisaDeviceState: DeviceState = {
                id: alisaDevice.id,
                capabilities: !candyDevice ? undefined : [
                    {
                        type: "devices.capabilities.mode",
                        state: {
                            instance: "program",
                            value: programCodeToMode(candyDevice.current_status_parameters.PrCode, candyDevice.current_status_parameters.DryT)
                        }
                    },
                    {
                        type: "devices.capabilities.toggle",
                        state: {
                            instance: "pause",
                            value: candyDevice.current_status_parameters.MachMd === "3"
                        }
                    },
                    {
                        type: "devices.capabilities.on_off",
                        state: {
                            instance: "on",
                            value: true
                        }
                    }
                ],
                error_message: !candyDevice ? "Устройство не найдено" : undefined,
                error_code: !candyDevice ? "404": undefined
            };
            result.payload.devices.push(alisaDeviceState);
        }

        return result;
    }

    async sendState(alisaReq: SendStateReqAlisa): Promise<SendStateResAlisa | undefined> {
        const alisaDevice = alisaReq.payload.devices[0];

        const capability = alisaDevice.capabilities[0];

        let command: StartCommandReqCandyBody | PauseResumeCommandReqCandyBody | StopCommandReqCandyBody;
        if (capability.type === "devices.capabilities.toggle" && capability.state.instance === "pause") {
            command = {
                encrypted: "0",
                Pa: capability.state.value ? "1" : "0"
            } as PauseResumeCommandReqCandyBody;
        } else if (capability.type === "devices.capabilities.mode" && capability.state.instance === "program") {
            command = modeToComand(capability.state.value as AlisaModes)
        } else if (capability.type === "devices.capabilities.on_off" && capability.state.instance === "on") {
            command = {
                StSt: "0",
                Write: "1"
            } as StopCommandReqCandyBody;
        } else {
            return;
        }
        
        const commandReqCandy: CommandReqCandy = {
            appliance_id: alisaDevice.id,
            body: Object.entries(command).map(e => e[0] + "=" + e[1]).join("&"),
        };

        const response = await fetch(this.host + this.commandUrl,
            { method: 'POST', headers: this.headersForCommand, body: JSON.stringify(commandReqCandy) });
        const commandResult = await response.json();

        const result: SendStateResAlisa = {
            request_id: Date.now().toString(),
            payload: {
                devices: [{
                    id: alisaDevice.id,
                    capabilities: [
                        {
                            type: capability.type,
                            state: {
                                instance: capability.state.instance,
                                action_result: {
                                    status: "DONE"
                                }
                            }
                        }
                    ]
                }]
            }
        };

        return result;
    }
}
