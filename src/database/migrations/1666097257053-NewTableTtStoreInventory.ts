import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewTableTtStoreInventory1666097257053 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
		  const table = new Table({
            name: 'tt_store_inventory',
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
                    name: 'store_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                },{
                    name: 'prod_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                },
				{
                    name: 'product_quantity',
                    type: 'int',
                    length: '11',
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
            ],
        });
        const ifExsist = await queryRunner.hasTable('tt_store_inventory');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('tt_store_inventory', true);
    }

}

