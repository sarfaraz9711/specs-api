import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateTtStoreInventoryRelationToTmStore1666155963610 implements MigrationInterface {

   private tableForeignKey = new TableForeignKey({
        name: 'fk_ttstoreinventory_tmstore',
        columnNames: ['store_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tm_store',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tt_store_inventory');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('store_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }
	
	
    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tt_store_inventory');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('store_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
    }

}