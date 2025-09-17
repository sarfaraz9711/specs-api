import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTablePageAddFileUrl1677158696035 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table page add column file_url varchar (255) default null');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('page', 'file_url');
    }

}
