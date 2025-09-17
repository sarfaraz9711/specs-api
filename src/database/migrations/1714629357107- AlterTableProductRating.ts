import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableProductRating1714629357107 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE product_rating MODIFY COLUMN is_comment_approved int(11)');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE product_rating MODIFY COLUMN is_comment_approved varchar(255)');

    }

}
