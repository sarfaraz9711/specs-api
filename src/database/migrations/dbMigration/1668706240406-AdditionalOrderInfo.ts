import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class AdditionalOrderInfo1668706240406 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tt_mig_additional_order_details_mapping',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'order_id',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                }, {
                    name: 'old_order_id',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'old_order_by_id',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'old_invoice_no',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'order_date',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
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
        });

        const table1 = new Table({
            name: 'tt_mig_old_payment_details',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                // {
                //     name: 'old_payment_id',
                //     type: 'int',
                //     length: '11',
                //     isPrimary: false,
                //     isNullable: false,
                //     isGenerated: false
                // },
                {
                    name: 'order_id',
                    type: 'varchar',
                    length: '200',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'paid_date',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'payment_number',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'payment_information',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'payment_amount',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },
                {
                    name: 'payment_commission_amount',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                    isGenerated: false
                },{
                    name: 'is_payment',
                    type: 'int',
                    length: '1',
                    isPrimary: false,
                    isNullable: true,
                    isGenerated: false,
                    default : 0
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
        });

        const ifExsist = await queryRunner.hasTable('tt_mig_additional_order_details_mapping');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }

        const ifExsist1 = await queryRunner.hasTable('tt_mig_old_payment_details');
        if (!ifExsist1) {
            await queryRunner.createTable(table1);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_mig_additional_order_details_mapping', true);
        await queryRunner.dropTable('tt_mig_old_payment_details', true);
    }
}

