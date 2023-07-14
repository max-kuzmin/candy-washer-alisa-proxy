export type AlisaModes = "dry" | "express" | "normal" | "eco" | "auto";
export type CapabilitiesTypes = "devices.capabilities.mode" | "devices.capabilities.toggle" | "devices.capabilities.on_off";
export type CapabilitiesInstances = "program" | "pause" | "on";

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