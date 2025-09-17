import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class NewTableCartValueBasedPromotion1668601072711 implements MigrationInterface {

    private tableForeignKey = new TableForeignKey({
        name: 'fk_product_cartvaluebasedpromotion',
        columnNames: ['product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
    });


    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'tm_cart_value_based_promotion',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },                 {
                    name: 'product_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                 {
                    name: 'cart_value',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'max_cart_value',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'discount_type',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'discount_value',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'is_active',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'start_date',
                    type: 'date',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'end_date',
                    type: 'date',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'start_time',
                    type: 'time',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'end_time',
                    type: 'time',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'starttimestamp',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                },{
                    name: 'endtimestamp',
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
        const ifExsist = await queryRunner.hasTable('tm_cart_value_based_promotion');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
        const ifDataExsist1 = table.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
        if (!ifDataExsist1) {
            await queryRunner.createForeignKey(table, this.tableForeignKey);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('tm_cart_value_based_promotion', true);
    }

}