import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AlterTableTmOrderReturn1673007305842 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const order_product_id = await queryRunner.hasColumn('tm_order_return', 'order_product_id');
        if (!order_product_id) {
        await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'order_product_id',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_order_return', 'order_product_id');

    }

}
