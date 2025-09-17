import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddTableCoupanBasePromo1677149632378 implements MigrationInterface {
    
        public async up(queryRunner: QueryRunner): Promise<void> {
            const promotionFlag = await queryRunner.hasColumn('tm_coupon_based_promotion', 'order_id');
            if (!promotionFlag) {
            await queryRunner.addColumn('tm_coupon_based_promotion', new TableColumn({
                    name: 'order_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }));
            }
         
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropColumn('tm_coupon_based_promotion', 'order_id');

        }
    
    }
    

