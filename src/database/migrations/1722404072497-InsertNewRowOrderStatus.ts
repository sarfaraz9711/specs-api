import {MigrationInterface, QueryRunner} from "typeorm";

export class InsertNewRowOrderStatus1722404072497 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO order_status (order_status_id,name, is_active,priority) VALUES (19,'Expected Delivery',1,19),(20,'Order Preparing for dispatch',1,20),(21,'Return Applied',1,21),(22,'Return Cancelled',1,22),(23,'Return initiated',1,23),(24,'Return Picked',1,24),(25,'Return re-scheduled',1,25),(26,'Return In Transit',1,26),(27,'Q.C. Rejected',1,27),(28,'Return to Customer',1,28),(29,'Return Received',1,29),(30,'Refund Initiated',1,30),(31,'Refund Done',1,31),(32,'Order Undelivered',1,32),(33,'Shipment Return',1,33),(34,'Undelivered/Returned',1,34),(35,'Shipment Lost',1,35),(36,'Return Delivered',1,36)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
