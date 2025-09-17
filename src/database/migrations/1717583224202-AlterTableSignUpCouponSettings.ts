import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableSignUpCouponSettings1717583224202 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE signup_promotion_setting MODIFY COLUMN start_date varchar(255)');
        await queryRunner.query('ALTER TABLE signup_promotion_setting MODIFY COLUMN end_date varchar(255)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
    }

}
