import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class PinelabsOrders1665050703207 implements MigrationInterface {
    private tableForeignKey = new TableForeignKey({
        name: 'fk_tt_pine_labs_tt_pine_labs_orders',
        columnNames: ['pineLabsFkId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tt_pine_labs',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = new Table({
            name : "tt_pine_labs_orders",
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    length: '20',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'pineLabsFkId',
                    type: 'bigint',
                    length: '20',
                    isPrimary: false,
                    isNullable: false
                },
                {
                    name: 'product_code',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'product_amount',
                    type: 'varchar',
                    length: '50',
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
            ]
        });
        const ifExsist = await queryRunner.hasTable('tt_pine_labs_orders');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }

        
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('pineLabsFkId') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_pine_labs_orders', true);
    }

}
