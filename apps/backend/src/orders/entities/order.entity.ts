import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { UserAddress } from '../../user-addresses/entities/user-address.entity';
import { DeliveryZone } from '../../delivery-zones/entities/delivery-zone.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, ACCEPTED, COOKING, READY, OUT_FOR_DELIVERY, COMPLETED, CANCELLED

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  // Delivery fields
  @ManyToOne(() => UserAddress, { nullable: true })
  @JoinColumn({ name: 'deliveryAddressId' })
  deliveryAddress: UserAddress | null;

  @Column({ type: 'uuid', nullable: true })
  deliveryAddressId: string | null;

  @ManyToOne(() => DeliveryZone, { nullable: true })
  @JoinColumn({ name: 'deliveryZoneId' })
  deliveryZone: DeliveryZone | null;

  @Column({ type: 'uuid', nullable: true })
  deliveryZoneId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ nullable: true })
  specialInstructions: string;

  // Snapshot of delivery address (in case original is deleted)
  @Column({ type: 'jsonb', nullable: true })
  deliveryAddressSnapshot: {
    label: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
    instructions?: string;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
