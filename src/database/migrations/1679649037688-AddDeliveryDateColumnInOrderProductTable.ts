import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddDeliveryDateColumnInOrderProductTable1679649037688 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const deliveredDate = await queryRunner.hasColumn('order_product', 'delivered_date');
        if (!deliveredDate) {
            await queryRunner.addColumn('order_product', new TableColumn({
                name: 'delivered_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: null,
                }));
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order_product', 'delivered_date');
    }

}
