import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddCreditNoteForOrder1688994133521 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const columnExists = await queryRunner.hasColumn('order', 'credit_note_order');
        if (!columnExists) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'credit_note_order',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'credit_note_order');
    }

}