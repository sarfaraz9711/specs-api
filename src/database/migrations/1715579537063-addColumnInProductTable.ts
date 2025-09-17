import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class addColumnInProductTable1715579537063 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isInventorySync = await queryRunner.hasColumn('inventory_sync', 'product');
        if (!isInventorySync) {
        await queryRunner.addColumn('product', new TableColumn({
            name: 'inventory_sync',
            type: 'int',
            length: '11',
            isPrimary: false,
            isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'inventory_sync');

    }

}
