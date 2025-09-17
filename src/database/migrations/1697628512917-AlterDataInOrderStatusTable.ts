import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterDataInOrderStatusTable1697628512917 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE order_status SET name = "Order Not Placed" WHERE name = "Order Processing"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
