import { CapabilityModes } from 'mk-alisa-proxy-base';
import { StartCommandReqCandyBody } from '../models/candy/command-req-candy';
import { NormalProgram, DryProgram, ExpressProgram, EcoProgram } from '../models/candy/programs-consts';
import { CandyFunctionStatus } from '../models/consts';

export function modeToComand(mode: CapabilityModes): StartCommandReqCandyBody | undefined {
    switch (mode) {
        case CapabilityModes.Normal: return NormalProgram;
        case CapabilityModes.Dry: return DryProgram;
        case CapabilityModes.Express: return ExpressProgram;
        case CapabilityModes.Eco: return EcoProgram;
        default: return;
    }
}

export function programCodeToMode(code: string, dry: string): CapabilityModes {
    switch (code) {
        case DryProgram.PrCode: return CapabilityModes.Dry;
        case EcoProgram.PrCode: return dry === CandyFunctionStatus.Off ? CapabilityModes.Eco : CapabilityModes.Normal;
        case ExpressProgram.PrCode: return CapabilityModes.Express;
        default: return CapabilityModes.Auto;
    }
}