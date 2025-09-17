import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnsInOrderTable1692521925074 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const old_cn_source_order_ids = await queryRunner.hasColumn('order', 'old_cn_source_order_ids');
        if (!old_cn_source_order_ids) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'old_cn_source_order_ids',
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
        await queryRunner.dropColumn('order', 'old_cn_source_order_ids');
    }

}
