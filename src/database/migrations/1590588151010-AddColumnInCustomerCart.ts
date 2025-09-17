import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnInCustomerCart1590588151010 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('customer_cart', 'tire_price');
        if (!ifExist) {
        await queryRunner.addColumn('customer_cart', new TableColumn({
                name: 'tire_price',
                type: 'decimal',
                length: '10,2',
                isPrimary: false,
                isNullable: true,
                }));
        }       
        
         const ifExist1 = await queryRunner.hasColumn('customer_cart', 'category_name');
        if (!ifExist1) {
        await queryRunner.addColumn('customer_cart', new TableColumn({
                name: 'category_name',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
                }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('customer_cart', 'tire_price');
        await queryRunner.dropColumn('customer_cart', 'category_name');
    }

}
