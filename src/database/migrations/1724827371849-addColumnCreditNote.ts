import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class addColumnCreditNote1724827371849 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const column1 = await queryRunner.hasColumn('email_id', 'tt_credit_notes');
        if (!column1) {
        await queryRunner.addColumn('tt_credit_notes', new TableColumn({
            name: 'email_id',
            type: 'varchar',
            isPrimary: false,
            isNullable: true
            }));
        }
        const column2 = await queryRunner.hasColumn('mobile', 'tt_credit_notes');
        if (!column2) {
        await queryRunner.addColumn('tt_credit_notes', new TableColumn({
            name: 'mobile',
            type: 'varchar',
            isPrimary: false,
            isNullable: true
            }));
        }
        const column3 = await queryRunner.hasColumn('channel_name', 'tt_credit_notes');
        if (!column3) {
        await queryRunner.addColumn('tt_credit_notes', new TableColumn({
            name: 'channel_name',
            type: 'varchar',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tt_credit_notes', 'email_id');

    }

}
