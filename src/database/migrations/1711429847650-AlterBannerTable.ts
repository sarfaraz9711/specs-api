import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterBannerTable1711429847650 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('banner_for', 'banner');
        if (!requestPayload) {
        await queryRunner.addColumn('banner', new TableColumn({
            name: 'banner_for',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('banner', 'banner-for');
    }

}
