import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnInProductTable1605507026632 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
       const ifExist1 = await queryRunner.hasColumn('product', 'hsn');
        if (!ifExist1) {
        await queryRunner.addColumn('product', new TableColumn({
                name: 'hsn',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'hsn');
    }

}
