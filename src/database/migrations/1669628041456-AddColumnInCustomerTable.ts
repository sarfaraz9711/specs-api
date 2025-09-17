import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInCustomerTable1669628041456 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const stateColumn = await queryRunner.hasColumn('customer', 'state');
        if (!stateColumn) {
        await queryRunner.addColumn('customer', new TableColumn({
                name: 'state',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const dobColumn = await queryRunner.hasColumn('customer', 'DOB');
        if (!dobColumn) {
        await queryRunner.addColumn('customer', new TableColumn({
                name: 'DOB',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('customer', 'state');
        await queryRunner.dropColumn('customer', 'DOB');
    }

}
