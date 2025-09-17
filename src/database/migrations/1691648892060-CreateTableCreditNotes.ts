import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableCreditNotes1691648892060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tt_credit_notes',
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
                    name: 'cn_code',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },{
                    name: 'cn_amount',
                    type: 'DECIMAL',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                }, {
                    name: 'cn_source_order_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    default: null,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'order_product_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'cn_created_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'cn_expiry_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                
                {
                    name: 'cn_applied_order_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    default: null,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'status',
                    type: 'varchar',
                    length: '255',
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
        const ifExsist = await queryRunner.hasTable('tt_credit_notes');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_credit_notes', true);
    }

}
