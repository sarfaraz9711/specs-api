import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInIngenicoTable1697442122475 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('request_payload', 'tt_ingenico_order_data');
        if (!requestPayload) {
        await queryRunner.addColumn('tt_ingenico_order_data', new TableColumn({
            name: 'request_payload',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }

        const responsePayload = await queryRunner.hasColumn('response_payload', 'tt_ingenico_order_data');
        if (!responsePayload) {
        await queryRunner.addColumn('tt_ingenico_order_data', new TableColumn({
            name: 'response_payload',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }

        const requestPayload1 = await queryRunner.hasColumn('request_payload', 'tt_paytm_order');
        if (!requestPayload1) {
        await queryRunner.addColumn('tt_paytm_order', new TableColumn({
            name: 'request_payload',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }

        const responsePayload1 = await queryRunner.hasColumn('response_payload', 'tt_paytm_order');
        if (!responsePayload1) {
        await queryRunner.addColumn('tt_paytm_order', new TableColumn({
            name: 'response_payload',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('tt_ingenico_order_data', 'request_payload');
        await queryRunner.dropColumn('tt_ingenico_order_data', 'response_payload');
        await queryRunner.dropColumn('tt_paytm_order', 'request_payload');
        await queryRunner.dropColumn('tt_paytm_order', 'response_payload');
    }

}
