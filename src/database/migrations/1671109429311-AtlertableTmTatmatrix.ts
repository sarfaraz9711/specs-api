import {MigrationInterface, QueryRunner} from "typeorm";

export class AtlertableTmTatmatrix1671109429311 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE tm_tat_matrix MODIFY COLUMN status int(11)');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query('ALTER TABLE tm_tat_matrix MODIFY COLUMN status varchar(255)');

    }

}
