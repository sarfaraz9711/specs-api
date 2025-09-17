import {MigrationInterface, QueryRunner} from "typeorm";

export class AltertableTtUserOtpData1673349870491 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_user_otp_data modify column otp_type varchar(50)');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table tt_user_otp_data modify column otp_type varchar(50)');

    }

}
