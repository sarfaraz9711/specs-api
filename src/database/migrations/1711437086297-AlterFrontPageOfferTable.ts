import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterFrontPageOfferTable1711437086297 implements MigrationInterface {
    
        public async up(queryRunner: QueryRunner): Promise<void> {
            const requestPayload = await queryRunner.hasColumn('list_type', 'tm_front_page_offer');
            if (!requestPayload) {
            await queryRunner.addColumn('tm_front_page_offer', new TableColumn({
                name: 'list_type',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true
                }));
            }
    
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropColumn('tm_front_page_offer', 'list_type');
        }
    
    }
    
