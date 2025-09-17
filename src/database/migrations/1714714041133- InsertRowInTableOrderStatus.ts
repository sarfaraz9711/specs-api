import {MigrationInterface, QueryRunner} from "typeorm";

export class InsertRowInTableOrderStatus1714714041133 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        //await queryRunner.query(`INSERT INTO order_status VALUES (17,'Coupon Issued','#fd0000',1,Null,Null,'','',17),(18,'Bank Refund','#fd0000',1,Null,Null,'','',18)`);
        await queryRunner.query(`INSERT INTO order_status (order_status_id,name, is_active,priority) VALUES (17,'Coupon Issued',1,17),(18,'Bank Refund',1,18)`);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
