import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInOrderTable1669700675370 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const columnExists = await queryRunner.hasColumn('order', 'uc_order_status');
        if (!columnExists) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'uc_order_status',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }

        const column2Exists = await queryRunner.hasColumn('order', 'sent_on_uc');
        if (!column2Exists) {
        await queryRunner.addColumn('order', new TableColumn({
            
                name: 'sent_on_uc',
                type: 'boolean',
                isPrimary: false,
                isNullable: true,
                default: false
            }));
        }
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'uc_order_status');
        await queryRunner.dropColumn('order', 'sent_on_uc');
    }

}
