import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTmEmail1670475560489 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const stateCodeColumn = await queryRunner.hasColumn('tm_email', 'html');
        if (!stateCodeColumn) {
        await queryRunner.addColumn('tm_email', new TableColumn({
                name: 'html',
                type: 'text',
                length: '30000',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.dropColumn('tm_email', 'html');

    }

}
