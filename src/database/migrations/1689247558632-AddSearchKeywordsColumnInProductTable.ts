import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddSearchKeywordsColumnInProductTable1689247558632 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const search_keywords = await queryRunner.hasColumn('product', 'search_keywords');
        if (!search_keywords) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'search_keywords',
                type: 'TEXT',
                isPrimary: false,
                isNullable: true,
            }));
        }
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'search_keywords');
    }

}
