import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewtableTmNotifyCustomer1673437951860 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tm_notify_customer',
              columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'customer_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'mobile_no',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'created_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'created_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
            ],
          });
          const ifExsist = await queryRunner.hasTable('tm_notify_customer');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable('tm_notify_customer', true);

    }

}
