import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTableTmStore1669802886842 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const shopIdColumn = await queryRunner.hasColumn('tm_store', 'facility_code');
        if (!shopIdColumn) {
        await queryRunner.addColumn('tm_store', new TableColumn({
                name: 'facility_code',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_store', 'facility_code');
    }

}
