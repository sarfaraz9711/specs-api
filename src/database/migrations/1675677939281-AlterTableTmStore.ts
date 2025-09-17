import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AlterTableTmStore1675677939281 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const storeCodecolumn = await queryRunner.hasColumn('tm_store', 'store_code');
        if (!storeCodecolumn) {
        await queryRunner.addColumn('tm_store', new TableColumn({
                name: 'store_code',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_store', 'store_code');

    }

}
