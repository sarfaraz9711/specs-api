import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnsInProductTable1666530731426 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {


        const productSizeColorColumnExists = await queryRunner.hasColumn('product', 'product_size_color');
        
        if (!productSizeColorColumnExists) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'product_size_color',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
        

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'product_size_color');
    }

}
