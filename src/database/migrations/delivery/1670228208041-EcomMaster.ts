import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class EcomMaster1670228208041 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_ecom_master',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'status',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'city_type',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'embargo_flag',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'pincode',
                    type: 'varchar',
                    length: '20',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'embargo_end_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'active',
                    type: 'varchar',
                    length: '10',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'state_code',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'city',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'dccode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'route',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'state',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'date_of_discontinuance',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'city_code',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'created_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'created_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
            ],
        });
        const ifExsist = await queryRunner.hasTable('tm_ecom_master');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_ecom_master', true);
    }


}
