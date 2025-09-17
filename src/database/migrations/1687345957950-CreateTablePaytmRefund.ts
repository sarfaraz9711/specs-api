import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTablePaytmRefund1687345957950 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = new Table({
            name: 'tt_paytm_refund',
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
                    name: 'orderPrefixId',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                }, {
                    name: 'mid',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'localRefundId',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'refundId',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'txnTimestamp',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                
                {
                    name: 'resultStatus',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'resultCode',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'resultMessage',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'userCreditInitiateStatus',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'merchantRefundRequestTimestamp',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'acceptRefundTimestamp',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'acceptRefundStatus',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'source',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'totalRefundAmount',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'refundAmount',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'txnAmount',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'txnId',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'refundDetailInfoList',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true
                },
                {
                    name: 'refundInitiateRequest',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true
                },
                {
                    name: 'refundInitiateResponse',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true
                },

{
                    name: 'schedulerResponse',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true
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
        const ifExsist = await queryRunner.hasTable('tt_paytm_refund');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_paytm_refund', true);
    }

}
