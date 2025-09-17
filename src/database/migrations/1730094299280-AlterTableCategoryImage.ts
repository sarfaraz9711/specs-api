import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableCategoryImage1730094299280 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('type', 'category_image');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('category_image', new TableColumn({
            name: 'type',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('category_image', 'type');
    }

}
