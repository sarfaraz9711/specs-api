import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class ColumnInTmStoreTable1714542230850 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const storeOpeningDate = await queryRunner.hasColumn('store_opening_date', 'tm_store');
        if (!storeOpeningDate) {
        await queryRunner.addColumn('tm_store', new TableColumn({
            name: 'store_opening_date',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

        const googleLocation = await queryRunner.hasColumn('google_location', 'tm_store');
        if (!googleLocation) {
        await queryRunner.addColumn('tm_store', new TableColumn({
            name: 'google_location',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_store', 'store_opening_date');
        await queryRunner.dropColumn('tm_store', 'google_location');
    }


}
