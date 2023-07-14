import { Driver, IamAuthService, getSACredentialsFromJson } from 'ydb-sdk';
import { OperationEntity } from '../models/ydb/operation-entity';
import { CapabilitiesTypes, YdbDatabasePath, YdbEndpoint } from '../models/consts';

export class YdbClient {
    private driver: Driver;

    async addOperation(type: CapabilitiesTypes, value: string, date: Date) {
        const query = `
            UPSERT INTO candy (time, type, value)
            VALUES (Datetime("${date.toISOString().split('.')[0]+'Z'}"), "${type}", "${value}")`;

        await this.driver.tableClient.withSession(session => session.executeQuery(query));
    }

    //TODO получать только TOP 1 записей каждого типа
    async getLastOperations(): Promise<OperationEntity[]> {
        const query = `
            SELECT *
            FROM candy
            ORDER BY time DESC
            LIMIT 10`;

        const { resultSets } = await this.driver.tableClient.withSession(session => session.executeQuery(query));
        const result = OperationEntity.createNativeObjects(resultSets[0]) as OperationEntity[];
        return result;
    }


    async createDriver(): Promise<void> {
        const creds = getSACredentialsFromJson("authorized_key.json");
        const driver = new Driver({
            endpoint: YdbEndpoint,
            database: YdbDatabasePath,
            authService: new IamAuthService(creds)
        });

        if (!await driver.ready(1000)) {
            console.error(`Driver has not become ready!`);
            process.exit(1);
        }
        this.driver = driver;
    }

    async dispose(): Promise<void> {
        this.driver.destroy();
    }
}