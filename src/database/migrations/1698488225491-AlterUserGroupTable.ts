import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserGroupTable1698488225491 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE user_group MODIFY COLUMN permission LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
