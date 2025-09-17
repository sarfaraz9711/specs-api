import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterSettingTable1709316497399 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('category-flag', 'settings');
        if (!requestPayload) {
        await queryRunner.addColumn('settings', new TableColumn({
            name: 'category-flag',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

        const requestPayload1 = await queryRunner.hasColumn('banner-flag', 'settings');
        if (!requestPayload1) {
        await queryRunner.addColumn('settings', new TableColumn({
            name: 'banner-flag',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

        const requestPayload2 = await queryRunner.hasColumn('front-images-flag', 'settings');
        if (!requestPayload2) {
        await queryRunner.addColumn('settings', new TableColumn({
            name: 'front-images-flag',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

        const requestPayload3 = await queryRunner.hasColumn('setting-flag', 'settings');
        if (!requestPayload3) {
        await queryRunner.addColumn('settings', new TableColumn({
            name: 'setting-flag',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('settings', 'category-flag');
        await queryRunner.dropColumn('settings', 'banner-flag');
        await queryRunner.dropColumn('settings', 'front-images-flag');
        await queryRunner.dropColumn('settings', 'setting-flag');
    }

}
