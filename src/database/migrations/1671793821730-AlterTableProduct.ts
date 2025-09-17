import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableProduct1671793821730 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table product modify column  meta_tag_title TEXT')
        await queryRunner.query('alter table product modify column  meta_tag_description TEXT')
        await queryRunner.query('alter table product modify column  upc varchar(50)')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query('alter table product modify column  meta_tag_title TEXT')
        await queryRunner.query('alter table product modify column  meta_tag_description TEXT')
        await queryRunner.query('alter table product modify column  upc varchar(50)')
    }

}
