import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class CustomerPreferenceRelationWithCustomer1672642982765 implements MigrationInterface {
      private tableForeignKey = new TableForeignKey({
        name: 'fk_otp_customer',
         columnNames: ['customer_id'],
         referencedColumnNames: ['id'],
         referencedTableName: 'customer',
     });

    public async up(queryRunner: QueryRunner): Promise<void> {
         const table = await queryRunner.getTable('rc_customer_preference');
         const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('customer_id') !== -1);
         if (!ifDataExsist) {
             await queryRunner.createForeignKey(table, this.tableForeignKey);
         }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
         const table = await queryRunner.getTable('rc_customer_preference');
         const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('customer_id') !== -1);
         if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
         }
    }

}
