import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterCouponBasedPromotionTable1696934434289 implements MigrationInterface {
    
        public async up(queryRunner: QueryRunner): Promise<void> {
            const ifExist = await queryRunner.hasColumn('tm_coupon_based_promotion', 'coupon_promotion_type');
            if (!ifExist) {
                await queryRunner.addColumn('tm_coupon_based_promotion', new TableColumn({
                    name: 'coupon_promotion_type',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropColumn('tm_coupon_based_promotion', 'coupon_promotion_type');
        }
    
    }
    
    
    
