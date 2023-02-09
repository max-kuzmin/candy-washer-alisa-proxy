import { AlisaModes } from "../models/consts";
import { StartCommandReqCandyBody } from "../models/candy/command-req-candy";
import { NormalProgram, DryProgram, ExpressProgram, EcoProgram } from "../models/candy/programs-consts";

export function modeToComand(mode: AlisaModes): StartCommandReqCandyBody | undefined {
    switch (mode) {
        case "normal": return NormalProgram;
        case "dry": return DryProgram;
        case "express": return ExpressProgram;
        case "eco": return EcoProgram;
        default: return;
    }
}

export function programCodeToMode(code: string, dry: string): AlisaModes | undefined {
    switch (code) {
        case "77": return "dry";
        case "135": return dry === "0" ? "eco" : "normal";
        case "71": return "express";
        default: return "auto";
    }
}