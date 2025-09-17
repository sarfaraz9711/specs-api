import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInOrderTable1669879116994 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const columnExists = await queryRunner.hasColumn('order', 'payment_state_code');
        if (!columnExists) {
        await queryRunner.addColumn('order', new TableColumn({
                name: 'payment_state_code',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }

        const column2Exists = await queryRunner.hasColumn('order', 'shipping_state_code');
        if (!column2Exists) {
        await queryRunner.addColumn('order', new TableColumn({
            
               name: 'shipping_state_code',
               type: 'varchar',
               length: '255',
               isPrimary: false,
               isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('order', 'payment_state_code');
        await queryRunner.dropColumn('order', 'shipping_state_code');
    }

}
