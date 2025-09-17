import {MigrationInterface, QueryRunner, 
    // TableForeignKey
} from "typeorm";

export class CreateOtpRelationToCustomer1664342386837 implements MigrationInterface {

    // private tableForeignKey = new TableForeignKey({
    //     name: 'fk_otp_customer',
    //     columnNames: ['customer_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'customer',
    // });

    public async up(queryRunner: QueryRunner): Promise<any> {
        // const table = await queryRunner.getTable('tt_user_otp_data');
        // const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('customer_id') !== -1);
        // if (!ifDataExsist) {
        //     await queryRunner.createForeignKey(table, this.tableForeignKey);
        // }
    }
	
	
    public async down(queryRunner: QueryRunner): Promise<any> {
        // const table = await queryRunner.getTable('tt_user_otp_data');
        // const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('customer_id') !== -1);
        // if (ifDataExsist) {
        //     await queryRunner.dropForeignKey(table, this.tableForeignKey);
        // }
    }

}
