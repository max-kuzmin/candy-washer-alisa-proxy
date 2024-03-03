export const ClientAppId = "3MVG9QDx8IX8nP5T2Ha8ofvlmjLZl5L_gvfbT9.HJvpHGKoAS_dcMN8LYpTSYeVFCraUnV.2Ag1Ki7m4znVO6";
export const ScopeString = "api+openid+refresh_token+web";
export const CandyAppRedirectUrl = "hon%3A%2F%2Fmobilesdk%2Fdetect%2Foauth%2Fdone";
const BaseHost = "haiereurope.my.site.com";
export const AuthHost = `https://${BaseHost}`;
export const OauthAppName = "SmartHome";
export const CandyTokenUrl = `https://${BaseHost}/${OauthAppName}/services/oauth2/token`;
export const CandyAuthUrl = `https://${BaseHost}/${OauthAppName}/services/oauth2/authorize`;
export const CandyLoginUrl = `https://${BaseHost}/${OauthAppName}/login`;
export const ProgressiveLoginRegex = `https:\/\/${BaseHost}.+?"`;

const HerocuAppHost = "https://simply-fi.herokuapp.com/api/v1/";
export const GetDevicesUrl = HerocuAppHost + "appliances.json?with_programs=0";
export const CommandUrl = HerocuAppHost + "commands.json";

export const YdbEndpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
export const YdbDatabasePath = "/ru-central1/b1g8t7pnet74nb0a922t/etnhnkabenkr164m83cv";

export enum AppliencesTypes {
    WasherDryer = "washer_dryer"
}

export enum MachineMode {
    Stop = "1",
    InProgress = "2",
    Pause = "3",
    DelayedStart = "5",
    Finished = "7"
}

export enum CandyFunctionStatus {
    Off = "0",
    On = "1"
}