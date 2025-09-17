import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class Pinelabs1665050648669 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name : "tt_pine_labs",
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    length: '20',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },{
                    name: 'amount',
                    type: 'varchar',
                    length: '10',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'currency_code',
                    type: 'varchar',
                    length: '15',
                    isPrimary: false,
                    isNullable: true,
                },
				{
                    name: 'order_desc',
                    type: 'varchar',
                    length: '500',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'country_code',
                    type: 'varchar',
                    length: '5',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'mobile_number',
                    type: 'varchar',
                    length: '13',
                    isPrimary: false,
                    isNullable: true,
                },
                
                {
                    name: 'email_id',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_first_name',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_last_name',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_address1',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_address2',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_address3',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_pin_code',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_city',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_state',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'billing_country',
                    type: 'varchar',
                    length: '13',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_first_name',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_last_name',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_address1',
                    type: 'varchar',
                    length: '250',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_address2',
                    type: 'varchar',
                    length: '250',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_address3',
                    type: 'varchar',
                    length: '250',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_pin_code',
                    type: 'varchar',
                    length: '6',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_city',
                    type: 'varchar',
                    length: '250',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_state',
                    type: 'varchar',
                    length: '100',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'shipping_country',
                    type: 'varchar',
                    length: '5',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'additional_info_data',
                    type: 'varchar',
                    length: '50',
                    isPrimary: false,
                    isNullable: true,
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
                },
            ]
        });
        const ifExsist = await queryRunner.hasTable('tt_pine_labs');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
        await queryRunner.query('ALTER TABLE `tt_pine_labs` ADD COLUMN `token_id` varchar(255) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `tt_pine_labs` ADD COLUMN `plural_order_id` varchar(255) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `tt_pine_labs` ADD COLUMN `payment_status` varchar(25) DEFAULT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_pine_labs', true);
    }

}
