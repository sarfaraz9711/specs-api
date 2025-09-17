import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableCustomerPreference1674550218643 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const status = await queryRunner.hasColumn('rc_customer_preference', 'status');
        if (!status) {
        await queryRunner.addColumn('rc_customer_preference', new TableColumn({
                name: 'status',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }

        const created_by = await queryRunner.hasColumn('rc_customer_preference', 'created_by');
        if (!created_by) {
        await queryRunner.addColumn('rc_customer_preference', new TableColumn({
            
               name: 'created_by',
               type: 'int',
               length: '11',
               isPrimary: false,
               isNullable: true,
            }));
        }

        const modified_by = await queryRunner.hasColumn('rc_customer_preference', 'modified_by');
        if (!modified_by) {
        await queryRunner.addColumn('rc_customer_preference', new TableColumn({
            
               name: 'modified_by',
               type: 'int',
               length: '11',
               isPrimary: false,
               isNullable: true,
            }));
        }
        const modified_date = await queryRunner.hasColumn('rc_customer_preference', 'modified_date');
        if (!modified_date) {
        await queryRunner.addColumn('rc_customer_preference', new TableColumn({
            
               name: 'modified_date',
               type: 'varchar',
               length: '255',
               isPrimary: false,
               isNullable: true,
            }));
        }

        const created_date = await queryRunner.hasColumn('rc_customer_preference', 'created_date');
        if (!created_date) {
        await queryRunner.addColumn('rc_customer_preference', new TableColumn({
            
               name: 'created_date',
               type: 'varchar',
               length: '255',
               isPrimary: false,
               isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('rc_customer_preference', 'status');
        await queryRunner.dropColumn('rc_customer_preference', 'created_by');
        await queryRunner.dropColumn('rc_customer_preference', 'modified_by');
        await queryRunner.dropColumn('rc_customer_preference', 'modified_date');
        await queryRunner.dropColumn('rc_customer_preference', 'created_date');





    }

}
