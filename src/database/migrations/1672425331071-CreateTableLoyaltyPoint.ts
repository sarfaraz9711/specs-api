import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableLoyaltyPoint1672425331071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'tm_loyalty_point_transaction',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'balance_points',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'points_value',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'redeem_points',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'reference_no',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'order_id',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'status',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'mobile_no',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },  {
                    name: 'created_by',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'int',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'created_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default:  'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default:  'CURRENT_TIMESTAMP',
                },
            ],
        });
        const ifExsist = await queryRunner.hasTable('tm_loyalty_point_transaction');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('tm_loyalty_point_transaction');
    }
}
