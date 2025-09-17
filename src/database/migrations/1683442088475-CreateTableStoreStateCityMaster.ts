import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableStoreStateCityMaster1683442088475 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_store_state_city_master',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },{
                    name: 'StateCode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'StoreState',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'CityName',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'CityCode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'PinCode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'DistrictName',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'DistrictCode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                }
            ]
            })
            const ifExsist = await queryRunner.hasTable('tm_store_state_city_master');
            if (!ifExsist) {
                await queryRunner.createTable(table);
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_store_state_city_master', true);
    }

}
