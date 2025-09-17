import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableAppointmentBooked1757587593016 implements MigrationInterface {
    
      public async up(queryRunner: QueryRunner): Promise<any> {
              const table = new Table({
                  name: 'appointment_booked',
                  columns: [
                      {
                          name: 'id',
                          type: 'integer',
                          length: '11',
                          isGenerated: true,
                          generationStrategy: 'increment',
                          isPrimary: true,
                          isNullable: false,
                      }, {
                          name: 'appointment_id',
                          type: 'varchar',
                          length: '255',
                          isPrimary: false,
                          isNullable: true,
                      }, {
                        name: 'user_id',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'mobile',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    },  {
                        name: 'full_name',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    },  {
                        name: 'address',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'appointment_date',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'appointment_time',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'appointment_status',
                        type: 'varchar',
                        length: '255',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'remarks',
                        type: 'longtext',
                        isPrimary: false,
                        isNullable: true,
                    }, {
                        name: 'is_active',
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
              const ifExsist = await queryRunner.hasTable('appointment_booked');
              if (!ifExsist) {
                  await queryRunner.createTable(table);
              }
          }
      
          public async down(queryRunner: QueryRunner): Promise<any> {
              await queryRunner.dropTable('appointment_booked', true);
          }
      }
      