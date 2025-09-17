import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AlterTabletthundredOffOnPrepaidOrder1691753599499 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const created_date = await queryRunner.hasColumn('tt-hundred-rupee-off-on-prepaid-order', 'created_date');
        if (!created_date) {
        await queryRunner.addColumn('tt-hundred-rupee-off-on-prepaid-order', new TableColumn({
                name: 'created_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }));
        }
        const modified_date = await queryRunner.hasColumn('tt-hundred-rupee-off-on-prepaid-order', 'modified_date');
        if (!modified_date) {
        await queryRunner.addColumn('tt-hundred-rupee-off-on-prepaid-order', new TableColumn({
                name: 'modified_date',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }));
        }
        const created_by = await queryRunner.hasColumn('tt-hundred-rupee-off-on-prepaid-order', 'created_by');
        if (!created_by) {
        await queryRunner.addColumn('tt-hundred-rupee-off-on-prepaid-order', new TableColumn({
                name: 'created_by',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }));
        }

        const modified_by = await queryRunner.hasColumn('tt-hundred-rupee-off-on-prepaid-order', 'modified_by');
        if (!modified_by) {
        await queryRunner.addColumn('tt-hundred-rupee-off-on-prepaid-order', new TableColumn({
                name: 'modified_by',
                type: 'datetime',
                isPrimary: false,
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tt-hundred-rupee-off-on-prepaid-order', 'created_date');
        await queryRunner.dropColumn('tt-hundred-rupee-off-on-prepaid-order', 'modified_date');
        await queryRunner.dropColumn('tt-hundred-rupee-off-on-prepaid-order', 'created_by');
        await queryRunner.dropColumn('tt-hundred-rupee-off-on-prepaid-order', 'modified_by');




    }

}
