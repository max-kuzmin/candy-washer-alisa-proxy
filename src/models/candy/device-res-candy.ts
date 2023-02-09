export interface CurrentStatusParameters {
    /** Признак подключения машины к управлению через приложение */
    WiFiStatus: "0" | "1";
    Err: string;
    /** Состояние 1 - остановлена, 2 - в процессе, 3 - пауза */
    MachMd: "1" | "2" | "3";
    PrNm: string;
    PrPh: string;
    /** Номер программы 1-200 */
    PrCode: string;
    SLevel: string;
    Temp: string;
    SpinSp: string;
    Opt1: string;
    Opt2: string;
    Opt3: string;
    Opt4: string;
    Opt5: string;
    Opt6: string;
    Opt7: string;
    Opt8: string;
    Opt9: string;
    Steam: string;
    DryT: string;
    RecipeId: string;
    CheckUpState: string;
    Lang: string;
    FillR: string;
    DelVal: string;
    /** Оставшееся время в секундах */
    RemTime: string;
    T0W: string;
    TIW: string;
    T0R: string;
    numF: string;
    unbF: string;
    unbC: string;
    NtcW: string;
    NtcD: string;
    motS: string;
    APSoff: string;
    APSfreq: string;
    chartL: string;
}

export interface AdditionalInfo {
    last_cycle: string;
    interface_type: string;
    last_activities: string;
    appliance_type_name: string;
}

export interface CommandParameter2 {
    name: string;
    datatype: string;
    validation: string;
}

export interface CommandParameter {
    command_parameter: CommandParameter2;
}

export interface Program2 {
    id: string;
    name: string;
    position: number;
    icon: string;
    description: string;
    hidden: boolean;
    created_at: Date;
    updated_at: Date;
    command_parameters: CommandParameter[];
}

export interface Program {
    program: Program2;
}

export interface Appliance {
    id: string;
    mac_address: string;
    sixteen_digits_code: string;
    purchase_date: string;
    /** Состояние */
    current_status_parameters: CurrentStatusParameters;
    current_status: any;
    ssid_name: string;
    ssid_password: any;
    ssid_security: string;
    encryption_key: string;
    plus_one_promo: boolean;
    plus_one_promo_duration: any;
    additional_info: AdditionalInfo;
    lwa_access_token: any;
    lwa_refresh_token: any;
    lwa_token_expire_date: any;
    lwa_client_id: any;
    statistics: string;
    appliance_settings: any;
    created_at: Date;
    programs?: Program[];
    /** Время последнего ответа от машины, если старее 2 минут, то машина выключена  */
    current_status_update: Date;
    receipt: string;
    appliance_type: string;
    appliance_model: string;
    interface_type: string;
    brand: string;
    connectivity: string;
    load_capacity: string;
    appliance_attributes: string;
}

export interface DeviceResCandy {
    appliance: Appliance;
}