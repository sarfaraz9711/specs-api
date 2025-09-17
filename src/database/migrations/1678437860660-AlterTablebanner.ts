import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTablebanner1678437860660 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `banner` modify column link TEXT')

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `banner` modify column link TEXT')

    }

}
