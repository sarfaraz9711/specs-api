import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTmStoreInventory1666248799776 implements MigrationInterface {
	//  private tableForeignKey = new TableForeignKey({
    //     name: 'fk_tm_store_tm_storeinventory',
    //     columnNames: ['store_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'tm_store',
    //     onDelete: 'CASCADE',
    // });
	
	
	
	


    public async up(queryRunner: QueryRunner): Promise<void> {
		  const table = new Table({
            name: 'tm_store_inventory',
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
                    name: 'storeIdFKId',
                    type: 'bigint',
                    length: '20',
                    isPrimary: false,
                    isNullable: false
                },{
                    name: 'product_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                },
				{
                    name: 'sku',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: false,
                },
				{
                    name: 'quantity',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
				{
                    name: 'status',
                    type: 'varchar',
                    length: '255',
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
        const ifExsist = await queryRunner.hasTable('tm_store_inventory');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
		
		// const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('store_id') !== -1);
        // if (!ifDataExsist) {
        //     await queryRunner.createForeignKey(table, this.tableForeignKey);
        // }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('tm_store_inventory', true);
    }

}

