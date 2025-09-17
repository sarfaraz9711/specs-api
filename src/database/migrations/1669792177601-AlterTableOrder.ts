import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableOrder1669792177601 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query('ALTER TABLE `order` CHANGE COLUMN shop_id store_id INT(11) DEFAULT NULL');


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `order` CHANGE COLUMN store_id shop_id INT(11) DEFAULT NULL');


    }

}
