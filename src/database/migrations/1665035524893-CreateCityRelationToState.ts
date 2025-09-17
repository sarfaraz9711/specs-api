import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CreateCityRelationToState1665035524893 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_city_state',
        columnNames: ['state_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tm_state',
    });

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tm_city');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('state_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }
	
	
    public async down(queryRunner: QueryRunner): Promise<any> {
        const table = await queryRunner.getTable('tm_city');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('state_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
    }

}
