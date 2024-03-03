import { Driver, IamAuthService, getSACredentialsFromJson } from 'ydb-sdk';
import { OperationEntity } from '../models/ydb/operation-entity';
import { YdbDatabasePath, YdbEndpoint } from '../models/consts';
import { CapabilitiesTypes, CapabilitiesInstances } from 'mk-alisa-proxy-base';

export class YdbClient {
    private driver!: Driver;

    async addOperation(type: CapabilitiesTypes, instance: CapabilitiesInstances, value: string, date: Date = new Date()) {
        if (!this.driver)
            await this.createDriver();

        const query = `
            UPSERT INTO candy (time, type, instance, value)
            VALUES (Datetime("${date.toISOString().split('.')[0]+'Z'}"), "${type}", "${instance}", "${value}")`;

        await this.driver.tableClient.withSession(session => session.executeQuery(query));
        await this.dispose();
    }

    async getLastOperations(): Promise<OperationEntity[]> {
        if (!this.driver)
            await this.createDriver();

        const query = `
            SELECT main.*
            FROM candy AS main
            INNER JOIN
                (SELECT MAX(time) AS time
                FROM candy
                GROUP BY type) AS latest
                ON latest.time = main.time`;

        const { resultSets } = await this.driver.tableClient.withSession(session => session.executeQuery(query));
        const result = OperationEntity.createNativeObjects(resultSets[0]!) as OperationEntity[];
        await this.dispose();
        return result;
    }


    private async createDriver(): Promise<void> {
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

    private async dispose(): Promise<void> {
        this.driver.destroy();
        this.driver = undefined!;
    }
}