import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableProduct1730099553693 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('flash_image', 'product');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('product', new TableColumn({
            name: 'flash_image',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'flash_image');
    }

}
