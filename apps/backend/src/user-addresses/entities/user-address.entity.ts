import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { DeliveryZone } from '../../delivery-zones/entities/delivery-zone.entity';

@Entity('user_address')
export class UserAddress extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string; // "Home", "Work", etc.

  @Column()
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ nullable: true })
  instructions: string; // Delivery instructions

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: number;

  @ManyToOne(() => DeliveryZone, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deliveryZoneId' })
  deliveryZone: DeliveryZone | null;

  @Column({ type: 'uuid', nullable: true })
  deliveryZoneId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
