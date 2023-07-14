import {declareType, TypedData, Types, withTypeOptions, snakeToCamelCaseConversion} from 'ydb-sdk';

export interface IOperationEntity {
    time: Date;
    type: string;
    value: string;
}

//TODO сохранять еще и инстанс
@withTypeOptions({namesConversion: snakeToCamelCaseConversion})
export class OperationEntity extends TypedData {
    @declareType(Types.DATETIME)
    public time: Date;

    @declareType(Types.STRING)
    public type: string;

    @declareType(Types.STRING)
    public value: string;

    static create(time: Date, type: string, value: string): OperationEntity {
        return new this({time, type, value});
    }

    constructor(data: IOperationEntity) {
        super(data);
        this.time = data.time;
        this.type = data.type;
        this.value = data.value;
    }
}
