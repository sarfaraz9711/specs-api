import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTtMigAdditionalOrderDetailsmappingTable1669725054833 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const shopIdColumn = await queryRunner.hasColumn('tt_mig_additional_order_details_mapping', 'shop_id');
        if (!shopIdColumn) {
        await queryRunner.addColumn('tt_mig_additional_order_details_mapping', new TableColumn({
                name: 'shop_id',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tt_mig_additional_order_details_mapping', 'shop_id');
    }

}
