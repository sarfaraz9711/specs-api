import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableSmsApp1680754719356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_sms',
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
                    name: 'order_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'customer_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'template_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'order_status_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'status',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
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
                }
            ]
            })
            const ifExsist = await queryRunner.hasTable('tm_sms');
            if (!ifExsist) {
                await queryRunner.createTable(table);
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_sms', true);
    }

}

