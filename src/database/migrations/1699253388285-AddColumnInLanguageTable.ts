import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInLanguageTable1699253388285 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('redirect_url', 'language');
        if (!requestPayload) {
        await queryRunner.addColumn('language', new TableColumn({
            name: 'redirect_url',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('language', 'redirect_url');
    }

}
