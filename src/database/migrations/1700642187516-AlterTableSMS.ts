import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableSMS1700642187516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tm_sms` CHANGE `customer_id` `customer_id` VARCHAR(255) NOT NULL;');
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
