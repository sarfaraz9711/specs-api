import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterOrderToAddColumn1669195417323 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order` add column tracking_id_fk int(11) default null');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('alter table `order` drop column tracking_id_fk');
    }

}
