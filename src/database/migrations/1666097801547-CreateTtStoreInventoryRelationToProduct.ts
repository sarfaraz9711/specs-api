import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateTtStoreInventoryRelationToProduct1666097801547 implements MigrationInterface {

   private tableForeignKey = new TableForeignKey({
        name: 'fk_ttstoreinventory_product',
        columnNames: ['prod_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tt_store_inventory');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('prod_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }
	
	
    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tt_store_inventory');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('prod_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
    }

}
