import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTmDeliveryExpectedEcomTable1671017631815 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const deliveryppartnercolumn = await queryRunner.hasColumn('tm_delivery_expected_ecom', 'delivery_partner');
        if (!deliveryppartnercolumn) {
        await queryRunner.addColumn('tm_delivery_expected_ecom', new TableColumn({
                name: 'delivery_partner',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.dropColumn('tm_delivery_expected_ecom', 'delivery_partner');

    }

}
