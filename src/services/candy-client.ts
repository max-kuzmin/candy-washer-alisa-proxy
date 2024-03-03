import { SmartHomeClient, DevicesResAlisa, DeviceFromList, StateReqAlisa, StateResAlisa, DeviceState, SendStateReqAlisa, SendStateResAlisa, DeviceFromSendState, Capability, DeviceTypes, CapabilitiesTypes, CapabilitiesInstances, CapabilityModes, HttpMethod } from 'mk-alisa-proxy-base';
import { programCodeToMode, modeToComand } from '../helpers/mode-to-program-code';
import { StartCommandReqCandyBody, PauseResumeCommandReqCandyBody, StopCommandReqCandyBody, CommandReqCandy } from '../models/candy/command-req-candy';
import { DeviceResCandy } from '../models/candy/device-res-candy';
import { YdbClient } from './ydb-client';
import { AppliencesTypes, MachineMode, CandyFunctionStatus, GetDevicesUrl, CommandUrl } from '../models/consts';

export class CandyClient extends SmartHomeClient {
    private readonly headers: HeadersInit;
    private readonly headersForCommand: HeadersInit;
    private readonly ydbClient = new YdbClient();
    private readonly oneMinuteBefore: Date;

    constructor(bearer: string, requestId: string) {
        super(requestId);

        this.headers = {
            "Salesforce-Auth": "1",
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
        const response = await fetch(GetDevicesUrl, { headers: this.headers });
        const devices: DeviceResCandy[] = await response.json();

        const result: DevicesResAlisa = {
            request_id: this.requestId,
            payload: {
                user_id: "yandex",
                devices: []
            }
        };

        const filteredDevices = devices.filter(e => e.appliance.appliance_type === AppliencesTypes.WasherDryer);
        for (const device of filteredDevices) {
            const appliance = device.appliance;
            const mappedDevice: DeviceFromList = {
                id: appliance.id,
                name: "Стиральная машина",
                description: "",
                type: DeviceTypes.WashingMachine,
                custom_data: {},
                room: "",
                device_info: {
                    hw_version: "1.0",
                    manufacturer: "Candy",
                    sw_version: "1.0",
                    model: appliance.appliance_model
                },
                properties: [],
                capabilities: [
                    {
                        type: CapabilitiesTypes.OnOff,
                        reportable: true,
                        retrievable: true,
                        parameters: {
                            instance: CapabilitiesInstances.On
                        }
                    },
                    {
                        type: CapabilitiesTypes.Mode,
                        retrievable: true,
                        reportable: true,
                        parameters: {
                            instance: CapabilitiesInstances.Program,
                            modes: [
                                {
                                    value: CapabilityModes.Dry //только сушка 60 минут
                                },
                                {
                                    value: CapabilityModes.Express // быстрая 30 минут без сушки
                                },
                                {
                                    value: CapabilityModes.Normal // смешанная 60 минут с сушкой
                                },
                                {
                                    value: CapabilityModes.Eco // смешанная 60 минут без сушки
                                },
                                {
                                    value: CapabilityModes.Auto //режим, который задает пользователь за пределами алисы
                                }
                            ]
                        },
                    },
                    {
                        type: CapabilitiesTypes.Toggle,
                        reportable: true,
                        retrievable: true,
                        parameters: {
                            instance: CapabilitiesInstances.Pause
                        }
                    }
                ]
            }

            result.payload.devices.push(mappedDevice);
        }

        return result;
    }

    async getState(alisaReq: StateReqAlisa): Promise<StateResAlisa> {
        return (await this.getStateInternal(alisaReq))[0];
    }

    private async getStateInternal(alisaReq: StateReqAlisa): Promise<[state: StateResAlisa, differs: boolean]> {
        const response = await fetch(GetDevicesUrl, { headers: this.headers });
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

        const isOnline = candyDevice.current_status_parameters.WiFiStatus === CandyFunctionStatus.On
            && new Date(candyDevice.current_status_update) > this.oneMinuteBefore;

        const alisaDeviceState: DeviceState = {
            id: alisaDevice.id,
            capabilities: [
                {
                    type: CapabilitiesTypes.Mode,
                    state: {
                        instance: CapabilitiesInstances.Program,
                        value: isOnline
                            ? programCodeToMode(candyDevice.current_status_parameters.PrCode, candyDevice.current_status_parameters.DryT)
                            : CapabilityModes.Auto
                    }
                },
                {
                    type: CapabilitiesTypes.Toggle,
                    state: {
                        instance: CapabilitiesInstances.Pause,
                        value: candyDevice.current_status_parameters.MachMd === MachineMode.Pause
                    }
                },
                {
                    type: CapabilitiesTypes.OnOff,
                    state: {
                        instance: CapabilitiesInstances.On,
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
                    : entity.value as CapabilityModes;
            }
        }

        return differs;
    }

    async sendState(alisaReq: SendStateReqAlisa): Promise<SendStateResAlisa> {
        const [actualState, stateDiffers] = await this.getStateInternal(alisaReq);
        const actualCapabilities = actualState.payload.devices[0]!.capabilities;
        const alisaDevice = alisaReq.devices[0]!;
        const capability = alisaDevice.capabilities[0]!;

        let command: StartCommandReqCandyBody | PauseResumeCommandReqCandyBody | StopCommandReqCandyBody | undefined;

        const lastOperations = await this.ydbClient.getLastOperations();
        if (stateDiffers && lastOperations.find(e => e.time > this.oneMinuteBefore))
            return this.composeSentStateResult(alisaDevice, true);

        // pause or continue
        if (capability.type === CapabilitiesTypes.Toggle && capability.state.instance === CapabilitiesInstances.Pause) {

            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice);
            if (error) return error;

            const isPause = capability.state.value ? CandyFunctionStatus.On : CandyFunctionStatus.Off;
            command = {
                encrypted: "0",
                Pa: isPause
            } as PauseResumeCommandReqCandyBody;

            this.ydbClient.addOperation(capability.type, capability.state.instance, capability.state.value.toString());

            // set program
        } else if (capability.type === CapabilitiesTypes.Mode && capability.state.instance === CapabilitiesInstances.Program) {
            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice, false);
            if (error) return error;

            const mode = capability.state.value as CapabilityModes;
            command = modeToComand(mode);
            this.ydbClient.addOperation(capability.type, capability.state.instance, mode);

            // stop
        } else if (capability.type === CapabilitiesTypes.OnOff && capability.state.instance === CapabilitiesInstances.On && !capability.state.value) {

            const error = this.errorIfModeIsAuto(actualCapabilities, alisaDevice);
            if (error) return error;

            command = {
                Write: "1",
                StSt: CandyFunctionStatus.Off
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
            const response = await fetch(CommandUrl,
                { method: HttpMethod.Post, headers: this.headersForCommand, body: JSON.stringify(commandReqCandy) });
            await response.json();
        } catch {
            return this.composeSentStateResult(alisaDevice, true);
        }

        return this.composeSentStateResult(alisaDevice, false);
    }

    private errorIfModeIsAuto(actualCapabilities: Capability[] | undefined, alisaDevice: DeviceFromSendState, isAuto = true): SendStateResAlisa | undefined {
        if (actualCapabilities?.find(e => e.type === CapabilitiesTypes.Mode
            && (isAuto && e.state.value === CapabilityModes.Auto || !isAuto && e.state.value !== CapabilityModes.Auto)))
            return this.composeSentStateResult(alisaDevice, true);

        return undefined;
    }
}
