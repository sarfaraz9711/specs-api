import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserRegistration1668494958919 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `customer` ADD `gender` varchar(10) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `customer` ADD `old_user_id` varchar(100) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `customer` ADD `user_creation_date` datetime DEFAULT NULL');
       
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `customer` DROP COLUMN `gender`');
        await queryRunner.query('ALTER TABLE `customer` DROP COLUMN `old_user_id`');
        await queryRunner.query('ALTER TABLE `customer` DROP COLUMN `user_creation_date`');
        
    }
}
