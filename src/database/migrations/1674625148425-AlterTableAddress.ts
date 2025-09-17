import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableAddress1674625148425 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table address modify column address_1 TEXT')
        await queryRunner.query('alter table address modify column address_2 TEXT')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table address modify column address_1 TEXT')
        await queryRunner.query('alter table address modify column address_2 TEXT')
    }

}
