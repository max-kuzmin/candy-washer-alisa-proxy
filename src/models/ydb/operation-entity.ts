import {declareType, TypedData, Types, withTypeOptions, snakeToCamelCaseConversion} from 'ydb-sdk';

export interface IOperationEntity {
    time: Date;
    type: string;
    instance: string;
    value: string;
}

@withTypeOptions({namesConversion: snakeToCamelCaseConversion})
export class OperationEntity extends TypedData {
    @declareType(Types.DATETIME)
    public time: Date;

    @declareType(Types.TEXT)
    public type: string;

    @declareType(Types.TEXT)
    public instance: string;

    @declareType(Types.TEXT)
    public value: string;

    static create(time: Date, type: string, instance: string, value: string): OperationEntity {
        return new this({time, type, instance, value});
    }

    constructor(data: IOperationEntity) {
        super(data);
        this.time = data.time;
        this.type = data.type;
        this.instance = data.instance;
        this.value = data.value;
    }
}
