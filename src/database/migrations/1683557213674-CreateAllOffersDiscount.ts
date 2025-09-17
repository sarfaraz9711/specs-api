import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateAllOffersDiscount1683557213674 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tm_discount_offer',
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
                    name: 'product_ids',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'enc_code',
                    type: 'longtext',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'url',
                    type: 'longtext',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'start_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'end_date',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'discount',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'status',
                    type: 'int',
                    length: '11',
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
            const ifExsist = await queryRunner.hasTable('tm_discount_offer');
            if (!ifExsist) {
                await queryRunner.createTable(table);
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_discount_offer', true);
    }

}
