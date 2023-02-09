export type AlisaModes = "dry" | "express" | "normal" | "eco" | "auto";
export type CapabilitiesTypes = "devices.capabilities.mode" | "devices.capabilities.toggle" | "devices.capabilities.on_off";
export type CapabilitiesInstances = "program" | "pause" | "on";

export const ClientAppId = "3MVG9QDx8IX8nP5T2Ha8ofvlmjKuido4mcuSVCv4GwStG0Lf84ccYQylvDYy9d_ZLtnyAPzJt4khJoNYn_QVB";
export const ScopeString = "api+id+openid+refresh_token+web";
export const CandyAppRedirectUrl = "candy%3A%2F%2Fmobilesdk%2Fdetect%2Foauth%2Fdone";
export const AuthHost = "https://he-accounts.force.com";
export const CandyTokenUrl = AuthHost + '/CandyApp/services/oauth2/token';
export const CandyAuthUrl = AuthHost + '/CandyApp/services/oauth2/authorize';
export const CandyLoginUrl = AuthHost + '/CandyApp/login';