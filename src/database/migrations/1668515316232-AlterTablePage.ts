import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTablePage1668515316232 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `page` ADD `old_content_id` int(11) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `page` ADD `old_content_creation_date` datetime DEFAULT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `page` DROP COLUMN `old_content_id`');
        await queryRunner.query('ALTER TABLE `page` DROP COLUMN `old_content_creation_date`');
    }

}
