import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterAppointmentBooked1546516990326 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const orderId = await queryRunner.hasColumn('order_id', 'appointment_booked');
        if (!orderId ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'order_id',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const eyePressure = await queryRunner.hasColumn('eye_pressure', 'appointment_booked');
        if (!eyePressure ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'eye_pressure',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const lensType = await queryRunner.hasColumn('lens_type', 'appointment_booked');
        if (!lensType ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'lens_type',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const visionLeft = await queryRunner.hasColumn('vision_left', 'appointment_booked');
        if (!visionLeft ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'vision_left',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const visionRight = await queryRunner.hasColumn('vision_right', 'appointment_booked');
        if (!visionRight ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'vision_right',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }
        const remarks = await queryRunner.hasColumn('agent_remarks', 'appointment_booked');
        if (!remarks ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'agent_remarks',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('appointment_booked', 'order_id');
        await queryRunner.dropColumn('appointment_booked', 'eye_pressure');
        await queryRunner.dropColumn('appointment_booked', 'lens_type');
        await queryRunner.dropColumn('appointment_booked', 'vision_left');
        await queryRunner.dropColumn('appointment_booked', 'vision_right');
        await queryRunner.dropColumn('appointment_booked', 'agent_remarks');
    }

}
