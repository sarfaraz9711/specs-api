import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableCustomerChangeAddressColumn1670481601647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE customer MODIFY COLUMN address text');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query('ALTER TABLE customer MODIFY COLUMN address varchar(255)');

    }

}
