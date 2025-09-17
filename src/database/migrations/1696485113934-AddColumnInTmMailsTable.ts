import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInTmMailsTable1696485113934 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const mailResp = await queryRunner.hasColumn('mail_response', 'tm_email');
        if (!mailResp) {
        await queryRunner.addColumn('tm_email', new TableColumn({
            name: 'mail_response',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }

        const orderReqPayload = await queryRunner.hasColumn('order_req_payload', 'order_total');
        if (!orderReqPayload) {
        await queryRunner.addColumn('order_total', new TableColumn({
            name: 'order_req_payload',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tm_email', 'mail_response');
        await queryRunner.dropColumn('order_total', 'order_req_payload');
    }

}
