import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class SchedulerFileSave1671276706844 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        const table = new Table({
            name: 'tm_file_url_save',
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
                  name: 'file_url',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              },
              {
                  name: 'module_type',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }
              ,
              {
                  name: 'e_tag',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }, 
              {
                  name: 'version_id',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }, 
              {
                  name: 'key',
                  type: 'varchar',
                  length: '255',
                  isPrimary: false,
                  isNullable: true,
              }, 
              {
                  name: 'second_key',
                  type: 'varchar',
                  length: '255',
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
        const ifExsist = await queryRunner.hasTable('tm_file_url_save');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tm_file_url_save', true);
    }

}
