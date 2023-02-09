export interface CommandReqCandy {
    appliance_id: string;
    /** Содержит строку формата ключ=значение&ключ=значение */
    body: string;
}

export interface StartCommandReqCandyBody {
    /** Признак записи, всегда 1 */
    Write: "1";
    /** Состояние, Старт = 1, стоп = 0 */
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
    /** Уровень пара при сушке ? */
    SLevTgt: "0" | "2";
    /** Целевая скорость вращения x100 */
    SpdTgt: "8" | "10" | undefined;
    /** Предварительная стирка ? */
    OptMsk1: "0";
    /** Гигиена плюс ? */
    OptMsk2: "0";
    /** Язык ? */
    Lang: "1";
    /** Пар 0 - выкл, 5 - вкл steam, возможны значения 0..5 */
    Stm: "0" | "5";
    /** Сушка 0 - выкл, 3 - хранение, 7 - быстрая 60ммн */
    Dry: "0" | "3" | "7";
    /** ??? */
    ED: "0";
    /** Спец программы, D_143 - сушка 60 мин */
    RecipeId: "0" | "D_143";
    /** Запуск диагностики */
    StartCheckUp: "0";
    /** Запуск диагностики экрана */
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