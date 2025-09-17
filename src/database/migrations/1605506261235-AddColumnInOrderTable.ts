import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnInOrderTable1605506261235 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist3 = await queryRunner.hasColumn('order', 'customer_gst_no');
        const ifExist4 = await queryRunner.hasColumn('order', 'order_cancel_reason');
        const ifExist5 = await queryRunner.hasColumn('order', 'order_cancel_remark');
        const ifExist6 = await queryRunner.hasColumn('order', 'total_tax');
        const ifExist7 = await queryRunner.hasColumn('order', 'total_items_price');
        if (!ifExist3) {
            await queryRunner.addColumn('order', new TableColumn({
                    name: 'customer_gst_no',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }
        
        if (!ifExist4) {
            await queryRunner.addColumn('order', new TableColumn({
                    name: 'order_cancel_reason',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }
        
            if (!ifExist5) {
                await queryRunner.addColumn('order', new TableColumn({
                        name: 'order_cancel_remark',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }));
                }
                if (!ifExist6) {
                    await queryRunner.addColumn('order', new TableColumn({
                            name: 'total_tax',
                            type: 'int',
                            length: '11',
                            isPrimary: false,
                            isNullable: true,
                        }));
                    }
                    if (!ifExist7) {
                        await queryRunner.addColumn('order', new TableColumn({
                                name: 'total_items_price',
                                type: 'varchar',
                                length: '255',
                                isPrimary: false,
                                isNullable: true,
                            }));
                        }
        }
            
    public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.dropColumn('order', 'customer_gst_no');
       await queryRunner.dropColumn('order', 'order_cancel_reason');
       await queryRunner.dropColumn('order', 'order_cancel_remark');
       await queryRunner.dropColumn('order', 'total_tax');
       await queryRunner.dropColumn('order', 'total_items_price');
    }

}
