import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTmEmailOrder1685280413559 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        const stateCodeColumn = await queryRunner.hasColumn('tm_email', 'order_id');
        if (!stateCodeColumn) {
        await queryRunner.addColumn('tm_email', new TableColumn({
                name: 'order_id',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }       
        
        const order_status_id = await queryRunner.hasColumn('tm_email', 'order_status_id');
        if (!order_status_id) {
        await queryRunner.addColumn('tm_email', new TableColumn({
                name: 'order_status_id',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.dropColumn('tm_email', 'order_id');
        await queryRunner.dropColumn('tm_email', 'order_status_id');
        

    }

}

