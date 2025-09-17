import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableTmDeliverTat1691041452230 implements MigrationInterface {

            public async up(queryRunner: QueryRunner): Promise<void> {
                const stateCodeColumn = await queryRunner.hasColumn('tm_delivery_expected_delhivery', 'pincode');
                if (!stateCodeColumn) {
                await queryRunner.addColumn('tm_delivery_expected_delhivery', new TableColumn({
                        name: 'pincode',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }));
                }
            }
        
            public async down(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.dropColumn('tm_delivery_expected_delhivery', 'pincode');
        
            }
        
}
        
