import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterTableAddress1687433555791 implements MigrationInterface {

    
        public async up(queryRunner: QueryRunner): Promise<void> {
            const stateCodeColumn = await queryRunner.hasColumn('address', 'phone_no_alter');
            if (!stateCodeColumn) {
            await queryRunner.addColumn('address', new TableColumn({
                    name: 'phone_no_alter',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropColumn('address', 'phone_no_alter');
    
        }
    
    
    
}
