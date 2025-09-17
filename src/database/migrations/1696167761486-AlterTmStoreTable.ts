import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTmStoreTable1696167761486 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `tm_store` CHANGE `id` `id` INT NOT NULL AUTO_INCREMENT, ADD KEY(`id`);');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
