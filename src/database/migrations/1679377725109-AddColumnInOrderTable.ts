import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInOrderTable1679377725109 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const sentOnMloyal = await queryRunner.hasColumn('order', 'sent_on_mloyal');
        if (!sentOnMloyal) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'sent_on_mloyal',
                type: 'int',
                length: '11',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'sent_on_mloyal');
    }

}
