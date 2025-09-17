import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class CreateTmStoreRelationToTmCity1665138504291 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_store_city',
        columnNames: ['city_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tm_city',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        console.log("ok");
        const table = await queryRunner.getTable('tm_store');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('city_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }


        /*const table = await queryRunner.getTable('tm_store');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('city_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }*/
    }
	
	
    public async down(queryRunner: QueryRunner): Promise<any> {
        console.log("ok");
       /* const table = await queryRunner.getTable('tm_store');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('city_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }*/
        const table = await queryRunner.getTable('tm_store');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('city_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }

}
