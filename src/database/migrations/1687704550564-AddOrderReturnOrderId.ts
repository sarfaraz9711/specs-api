import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddOrderReturnOrderId1687704550564 implements MigrationInterface {

    
        public async up(queryRunner: QueryRunner): Promise<any> {
            const ifExist = await queryRunner.hasColumn('tm_order_return', 'order_product_prefix_id');
            if (!ifExist) {
                await queryRunner.addColumn('tm_order_return', new TableColumn({
                    name: 'order_product_prefix_id',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }


        }
    
        public async down(queryRunner: QueryRunner): Promise<any> {
            await queryRunner.dropColumn('tm_order_return', 'order_product_prefix_id');
        }
    
    }
    


