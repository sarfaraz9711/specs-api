import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterOrderTableFaclity1720416736962 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('facility_code', 'order_product');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('order_product', new TableColumn({
            name: 'facility_code',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const isFacilityName = await queryRunner.hasColumn('facility_name', 'order_product');
        if (!isFacilityName ) {
        await queryRunner.addColumn('order_product', new TableColumn({
            name: 'facility_name',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order_product', 'facility_code');
        await queryRunner.dropColumn('order_product', 'facility_name');
    }

}
