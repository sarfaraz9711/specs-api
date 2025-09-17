import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterDiscountOfferTable1699002159665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_discount_offer MODIFY COLUMN discount varchar(255) NULL;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
