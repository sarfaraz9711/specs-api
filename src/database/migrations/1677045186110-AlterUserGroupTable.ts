import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserGroupTable1677045186110 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table user_group change column modified_by modified_by int(11) default null;');
        await queryRunner.query('alter table user_group change column modified_date modified_date varchar(255) default null');
        await queryRunner.query('alter table user_group change column permission permission varchar(255) default null');
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table user_group change column modified_by modified_by int(11)');
        await queryRunner.query('alter table user_group change column modified_date modified_date varchar(255)');
        await queryRunner.query('alter table user_group change column permission permission varchar(255)');
    }

}
