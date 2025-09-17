import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddOrderShippingCahrges1687255123279 implements MigrationInterface {
    
        public async up(queryRunner: QueryRunner): Promise<void> {
    
            const sentOnMloyal = await queryRunner.hasColumn('order', 'shipping_charges');
            if (!sentOnMloyal) {
            await queryRunner.addColumn('order', new TableColumn({
                    name: 'shipping_charges',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }));
            } 
            
            const phoneNumberAlter = await queryRunner.hasColumn('order', 'phone_number_alter');
            if (!phoneNumberAlter) {
            await queryRunner.addColumn('order', new TableColumn({
                    name: 'phone_number_alter',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }));
            }
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropColumn('order', 'shipping_charges');
            await queryRunner.dropColumn('order', 'phone_number_alter');
        }
    
    }
    