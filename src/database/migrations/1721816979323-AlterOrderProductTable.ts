import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterOrderProductTable1721816979323 implements MigrationInterface {

   
    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('refund_amount', 'order_product');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('order_product', new TableColumn({
            name: 'refund_amount',
            type: 'int',
            length: '11',
            isPrimary: false,
            isNullable: true
            }));
        }
        const isFacilityName = await queryRunner.hasColumn('item_code', 'order_product');
        if (!isFacilityName ) {
        await queryRunner.addColumn('order_product', new TableColumn({
            name: 'item_code',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order_product', 'refund_amount');
        await queryRunner.dropColumn('order_product', 'item_code');
    }

}
