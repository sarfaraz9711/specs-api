import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnsInOrderReturnTable1692177959206 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const returnType = await queryRunner.hasColumn('tm_order_return', 'return_type');
        if (!returnType) {
        await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'return_type',
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
        await queryRunner.dropColumn('tm_order_return', 'return_type');
    }

}
