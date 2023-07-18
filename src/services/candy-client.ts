import { DeviceResCandy } from "../models/candy/device-res-candy";
import { DeviceFromList, DevicesResAlisa } from "../models/alisa/devices-res-alisa";
import fetch from "node-fetch";
import { Capability, DeviceState, StateResAlisa } from "../models/alisa/state-res-alisa";
import { StateReqAlisa } from "../models/alisa/state-req-alisa";
import { modeToComand, programCodeToMode } from "../helpers/mode-to-program-code";
import { DeviceFromSendState, SendStateReqAlisa } from "../models/alisa/send-state-req-alisa";
import { SendStateResAlisa } from "../models/alisa/send-state-res-alisa";
import { CommandReqCandy, PauseResumeCommandReqCandyBody, StartCommandReqCandyBody, StopCommandReqCandyBody } from "../models/candy/command-req-candy";
import { AlisaModes } from "../models/consts";
import { YdbClient } from './ydb-client';

export class CandyClient {
    private readonly host = "https://simply-fi.herokuapp.com/api/v1/";
    private readonly getDevicesUrl = "appliances.json?with_programs=0";
    private readonly commandUrl = "commands.json";
    private readonly headers: object;
    private readonly headersForCommand: object;
    private readonly ydbClient = new YdbClient();
    private readonly oneMinuteBefore: Date;

    constructor(bearer: string, private readonly requestId: string) {
        this.headers = {
            "Salesforce-Auth": 1,
            "Authorization": bearer
        };

        this.headersForCommand = {
            "Content-Type": "application/json",
            ...this.headers
        };

        this.oneMinuteBefore = new Date();
        this.oneMinuteBefore.setMinutes(this.oneMinuteBefore.getMinutes() - 1);
    }

    async getDevices(): Promise<DevicesResAlisa> {
        const response = await fetch(this.host + this.getDevicesUrl, { headers: this.headers });
        const devices: DeviceResCandy[] = await response.json();

        const result: DevicesResAlisa = {
            request_id: this.requestId,
            payload: {
                user_id: "yandex",
                devices: []
            }
        };

        const filteredDevices = devices.filter(e => e.appliance.appliance_type === "washer_dryer");
        for (const device of filteredDevices) {
            const appliance = device.appliance;
            const mappedDevice: DeviceFromList = {
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

    async getState(alisaReq: StateReqAlisa): Promise<[state: StateResAlisa, differs: boolean]> {
        const response = await fetch(this.host + this.getDevicesUrl, { headers: this.headers });
        const candyDevices: DeviceResCandy[] = await response.json();

        const result: StateResAlisa = {
            request_id: this.requestId,
            payload: {
                devices: []
            }
        };

        const alisaDevice = alisaReq.devices[0];
        if (!alisaDevice)
            return [result, false];

        const candyDevice = candyDevices.find(e => e.appliance.id === alisaDevice.id)?.appliance;
        if (!candyDevice) {
            const alisaDeviceState: DeviceState = {
                id: alisaDevice.id,
                error_message: "Устройство не найдено",
                error_code: "404"
            };
            result.payload.devices.push(alisaDeviceState);
            return [result, false];
        }

        const isOnline = candyDevice.current_status_parameters.WiFiStatus === "1"
            && new Date(candyDevice.current_status_update) > this.oneMinuteBefore;

        const alisaDeviceState: DeviceState = {
            id: alisaDevice.id,
            capabilities: [
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
                        value: isOnline
                    }
                }
            ]
        };
        
        const differs = await this.enrichValues(alisaDeviceState);
        result.payload.devices.push(alisaDeviceState);

        return [result, differs];
    }

    private async enrichValues(state: DeviceState): Promise<boolean> {
        if (!state.capabilities)
            return false;

        const lastOperations = await this.ydbClient.getLastOperations();
        let differs = false;

        for (const capability of state.capabilities) {
            const entity = lastOperations.filter(e => e.type === capability.type)[0];
            if (entity && entity.time > this.oneMinuteBefore) {
                differs = true;
                capability.state.value = (typeof capability.state.value === "boolean")
                    ? entity.value === "true"
                    : entity.value as AlisaModes;
            }
        }

        return differs;
    }

    async sendState(alisaReq: SendStateReqAlisa): Promise<SendStateResAlisa> {
        const [actualState, stateDiffers] = await this.getState(alisaReq);
        const actualCapabilities = actualState.payload.devices[0].capabilities;
        const alisaDevice = alisaReq.devices[0];
        const capability = alisaDevice.capabilities[0];

        let command: StartCommandReqCandyBody | PauseResumeCommandReqCandyBody | StopCommandReqCandyBody | undefined;

        const lastOperations = await this.ydbClient.getLastOperations();
        if (stateDiffers && lastOperations.find(e => e.time > this.oneMinuteBefore))
            return this.composeSentStateResult(alisaDevice, true);

        // pause or continue
        if (capability.type === "devices.capabilities.toggle" && capability.state.instance === "pause") {

            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice);
            if (error) return error;
                
            const isPause = capability.state.value ? "1" : "0";
            command = {
                encrypted: "0",
                Pa: isPause
            } as PauseResumeCommandReqCandyBody;

            this.ydbClient.addOperation(capability.type, capability.state.instance, capability.state.value.toString());

        // set program
        } else if (capability.type === "devices.capabilities.mode" && capability.state.instance === "program") {
            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice, false);
            if (error) return error;

            const mode = capability.state.value as AlisaModes;
            command = modeToComand(mode);
            this.ydbClient.addOperation(capability.type, capability.state.instance, mode);

        // stop
        } else if (capability.type === "devices.capabilities.on_off" && capability.state.instance === "on" && !capability.state.value) {
            
            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice);
            if (error) return error;

            command = {
                Write: "1",
                StSt: "0"
            } as StopCommandReqCandyBody;
            this.ydbClient.addOperation(capability.type, capability.state.instance, "false");

        // start and others
        } else {
            return this.composeSentStateResult(alisaDevice, true);
        }
        
        if (!command)
            return this.composeSentStateResult(alisaDevice, false);

        const commandReqCandy: CommandReqCandy = {
            appliance_id: alisaDevice.id,
            body: Object.entries(command).map(e => e[0] + "=" + e[1]).join("&"),
        };
        
        try {
            const response = await fetch(this.host + this.commandUrl,
                { method: "POST", headers: this.headersForCommand, body: JSON.stringify(commandReqCandy) });
            await response.json();
        } catch {
            return this.composeSentStateResult(alisaDevice, true);
        }

        return this.composeSentStateResult(alisaDevice, false);
    }

    private composeSentStateResult(alisaDevice: DeviceFromSendState, hasError: boolean): SendStateResAlisa {
        const capability = alisaDevice.capabilities[0];
        const result: SendStateResAlisa = {
            request_id: this.requestId,
            payload: {
                devices: [{
                    id: alisaDevice.id,
                    capabilities: [
                        {
                            type: capability.type,
                            state: {
                                instance: capability.state.instance,
                                action_result: {
                                    status: hasError ? "ERROR" : "DONE"
                                }
                            }
                        }
                    ]
                }]
            }
        };

        return result;
    }

    private errorIfModeIsAuto(actualCapabilities: Capability[] | undefined, alisaDevice: DeviceFromSendState, isAuto = true): SendStateResAlisa | undefined {
        if (actualCapabilities?.find(e => e.type === "devices.capabilities.mode"
            && (isAuto && e.state.value === 'auto' || !isAuto && e.state.value !== 'auto')))
                return this.composeSentStateResult(alisaDevice, true)
    }
}
