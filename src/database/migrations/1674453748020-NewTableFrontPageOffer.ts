import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class NewTableFrontPageOffer1674453748020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
	
        const table = new Table({
              name: 'tm_front_page_offer',
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
                    name: 'product_ids',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'show_on',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, 
                {
                    name: 'image_path',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },   {
                    name: 'title',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'link',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'content',
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
          const ifExsist = await queryRunner.hasTable('tm_front_page_offer');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_front_page_offer', true);

    }

}
