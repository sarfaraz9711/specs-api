import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableAppointmentSlot1757581247786 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<any> {
          const table = new Table({
              name: 'appointment',
              columns: [
                  {
                      name: 'id',
                      type: 'integer',
                      length: '11',
                      isGenerated: true,
                      generationStrategy: 'increment',
                      isPrimary: true,
                      isNullable: false,
                  },{
                      name: 'calendar_period',
                      type: 'int',
                      length: '11',
                      isPrimary: false,
                      isNullable: true,
                  }, {
                      name: 'booking_not_allowed_days',
                      type: 'varchar',
                      length: '255',
                      isPrimary: false,
                      isNullable: true,
                  }, {
                    name: 'saturday_off',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'sunday_off',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'start_time',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'end_time',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                      name: 'created_by',
                      type: 'integer',
                      length: '11',
                      isPrimary: false,
                      isNullable: true,
                  }, {
                      name: 'modified_by',
                      type: 'integer',
                      length: '11',
                      isPrimary: false,
                      isNullable: true,
                  }, {
                      name: 'created_date',
                      type: 'DATETIME',
                      isPrimary: false,
                      isNullable: true,
                      default:  'CURRENT_TIMESTAMP',
                  }, {
                      name: 'modified_date',
                      type: 'DATETIME',
                      isPrimary: false,
                      isNullable: true,
                      default:  'CURRENT_TIMESTAMP',
                  },
              ],
          });
          const ifExsist = await queryRunner.hasTable('appointment');
          if (!ifExsist) {
              await queryRunner.createTable(table);
          }
      }
  
      public async down(queryRunner: QueryRunner): Promise<any> {
          await queryRunner.dropTable('appointment', true);
      }
  }
  