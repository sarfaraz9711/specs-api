import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnsInUnicomResTable1692774001550 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const order_product_id = await queryRunner.hasColumn('unicommerce_response', 'order_product_id');
        if (!order_product_id) {
        await queryRunner.addColumn('unicommerce_response', new TableColumn({
            name: 'order_product_id',
            type: 'int',
            length: '11',
            isPrimary: false,
            isNullable: true,
            default: null,
            collation: "utf8mb4_unicode_ci"
        }));

            
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('unicommerce_response', 'order_product_id');
    }

}
