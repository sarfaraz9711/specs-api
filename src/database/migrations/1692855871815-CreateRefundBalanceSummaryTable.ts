import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateRefundBalanceSummaryTable1692855871815 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tt_refund_balance_summary',
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
                    name: 'order_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                },
                {
                    name: 'order_prefix_id',
                    type: 'VARCHAR',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    default: null,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'total_order_paid_amount',
                    type: 'DECIMAL',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'total_order_balance_amount',
                    type: 'DECIMAL',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
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
        const ifExsist = await queryRunner.hasTable('tt_refund_balance_summary');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_refund_balance_summary', true);
    }

}
