import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInReturnTable1694360824256 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('tm_order_return', 'mail_sent_status');
        if (!ifExist) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'mail_sent_status',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const ifExist1 = await queryRunner.hasColumn('tm_order_return', 'return_order_sku');
        if (!ifExist1) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'return_order_sku',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const ifExist2 = await queryRunner.hasColumn('tm_order_return', 'rp_code');
        if (!ifExist2) {
            await queryRunner.addColumn('tm_order_return', new TableColumn({
                name: 'rp_code',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_order_return', 'return_order_sku');
        await queryRunner.dropColumn('tm_order_return', 'rp_code');
    }

}
