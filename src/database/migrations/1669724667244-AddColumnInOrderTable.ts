import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInOrderTable1669724667244 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const shopIdColumn = await queryRunner.hasColumn('order', 'shop_id');
        if (!shopIdColumn) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'shop_id',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'shop_id');
    }

}
