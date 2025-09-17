import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableOrderReturn1693835500032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('tm_order_return', 'quantity');
        if (!ifExist) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'quantity',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const ifExist1 = await queryRunner.hasColumn('tm_order_return', 'sku_name');
        if (!ifExist1) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'sku_name',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const ifExist2 = await queryRunner.hasColumn('tm_order_return', 'vareint_id');
        if (!ifExist2) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'vareint_id',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const ifExist3 = await queryRunner.hasColumn('tm_order_return', 'varient_name');
        if (!ifExist3) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'varient_name',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'quantity');
        await queryRunner.dropColumn('order', 'sku_name');
        await queryRunner.dropColumn('order', 'vareint_id');
        await queryRunner.dropColumn('order', 'varient_name');
    }

}


