import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeOauthDateTypeOnCustomerTable1667997200621 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `customer` CHANGE `oauth_data` `oauth_data` text default NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `customer` CHANGE `oauth_data` `oauth_data` text default NULL');
    }

}
