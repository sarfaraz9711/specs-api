import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInAddressTable1669873743289 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const stateCodeColumn = await queryRunner.hasColumn('address', 'state_code');
        if (!stateCodeColumn) {
        await queryRunner.addColumn('address', new TableColumn({
                name: 'state_code',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('address', 'state_code');

    }

}
