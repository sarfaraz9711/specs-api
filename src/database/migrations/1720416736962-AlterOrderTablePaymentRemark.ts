import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterOrderTablePaymentRemark1720416736962 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('payment_remark', 'order');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('order', new TableColumn({
            name: 'payment_remark',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'payment_remark');
    }

}
