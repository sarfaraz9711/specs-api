import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInVarientTable1666856027246 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const productSizeColorColumnExists = await queryRunner.hasColumn('varients', 'category');
        if (!productSizeColorColumnExists) {
        await queryRunner.addColumn('varients', new TableColumn({
                name: 'category',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        const varientDisplayName = await queryRunner.hasColumn('varients', 'varient_display_name');
    
        if (!varientDisplayName) {
        await queryRunner.addColumn('varients', new TableColumn({
                name: 'varient_display_name',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('varients', 'category');
        await queryRunner.dropColumn('varients', 'varient_display_name');
    }

}
