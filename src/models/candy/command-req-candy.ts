export interface CommandReqCandy {
    appliance_id: string;
    /** Содержит строку формата ключ=значение&ключ=значение */
    body: string;
}

export interface StartCommandReqCandyBody {
    /** Признак записи, всегда 1 */
    Write: "1";
    /** Старт = 1, стоп = 0 */
    StSt: "1";
    /** Задержка в минутах, например 0-299 */
    DelVl: string;
    /** Номер программы selector_position */
    PrNm: string;
    /** Код программы pr_code */
    PrCode: string;
    /** Название кода программы */
    PrStr: string;
    /** Целевая температура default_temperature */
    TmpTgt: "30" | "40" | undefined;
    /** Уровень загрязнения 0-3 default_soil_level */
    SLevTgt: "0" | "2";
    /** Целевая скорость вращения default_spin_speed / 10 */
    SpdTgt: "8" | "10" | undefined;
    /** Всегда 0 */
    OptMsk1: "0";
    /** Всегда 0 */
    OptMsk2: "0";
    /** Всегда 1 */
    Lang: "1";
    /** Пар 0 - выкл, 5 - вкл steam (1=5) */
    Stm: "0" | "5";
    /** Сушка 0 - выкл, 3 - хранение, 7 - быстра 60ммн */
    Dry: "0" | "3" | "7";
    /** ??? */
    ED: "0";
    /** Спец программы, D_143 - сушка 60 мин */
    RecipeId: "0" | "D_143";
    /** Всегда 0 */
    StartCheckUp: "0";
    /** Всегда 1 */
    DispTestOn: "1";
}


export interface PauseResumeCommandReqCandyBody {
    /** Всегда 0 */
    encrypted: "0";
    /** 1 - пауза, 0 - продолжить */
    Pa: "0" | "1";
}


export interface StopCommandReqCandyBody {
    /** Признак записи, всегда 1 */
    Write: "1";
    /** Старт = 1, стоп = 0 */
    StSt: "0";
}