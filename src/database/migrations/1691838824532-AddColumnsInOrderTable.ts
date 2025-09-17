import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnsInOrderTable1691838824532 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const cn_code = await queryRunner.hasColumn('order', 'applied_cn_amount');
        if (!cn_code) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'applied_cn_amount',
                type: 'DECIMAL',
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        const cn_code1 = await queryRunner.hasColumn('order', 'applied_cn_code');
        if (!cn_code1) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'applied_cn_code',
                type: 'VARCHAR',
                length: "255",
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        const cn_amount = await queryRunner.hasColumn('order_product', 'applied_cn_amount');
        if (!cn_amount) {
        await queryRunner.addColumn('order_product', new TableColumn({
                name: 'applied_cn_amount',
                type: 'DECIMAL',
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        const cn_code3 = await queryRunner.hasColumn('order_product', 'applied_cn_code');
        if (!cn_code3) {
        await queryRunner.addColumn('order_product', new TableColumn({
                name: 'applied_cn_code',
                type: 'VARCHAR',
                length: "255",
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        const order_applied_return_cancelled_type = await queryRunner.hasColumn('order', 'given_return_cancelled_type');
        if (!order_applied_return_cancelled_type) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'given_return_cancelled_type',
                type: 'VARCHAR',
                length: '255',
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        const op_applied_return_cancelled_type = await queryRunner.hasColumn('order_product', 'given_return_cancelled_type');
        if (!op_applied_return_cancelled_type) {
        await queryRunner.addColumn('order_product', new TableColumn({
                name: 'given_return_cancelled_type',
                type: 'VARCHAR',
                length: '255',
                isPrimary: false,
                isNullable: true,
                default: null,
                collation: "utf8mb4_unicode_ci"
            }));
        }

        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'applied_cn_amount');
        await queryRunner.dropColumn('order_product', 'applied_cn_amount');
        await queryRunner.dropColumn('order', 'given_return_cancelled_type');
        await queryRunner.dropColumn('order_product', 'given_return_cancelled_type');
        await queryRunner.dropColumn('order', 'applied_cn_code');
        await queryRunner.dropColumn('order_product', 'applied_cn_code');

    }

}
