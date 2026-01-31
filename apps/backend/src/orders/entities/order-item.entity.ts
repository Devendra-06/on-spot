import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from './order.entity';
import { Menu } from '../../menus/entities/menu.entity';

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Snapshot of the base price at the time of order

  @Exclude()
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Menu, { eager: true })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: Menu;

  // Variant snapshot
  @Column({ nullable: true })
  variantId: string;

  @Column({ nullable: true })
  variantName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  variantPrice: number | null;

  // Addons snapshot
  @Column({ type: 'jsonb', nullable: true })
  selectedAddons: SelectedAddon[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  addonsTotal: number;

  // Calculated total for this line item (base/variant price + addons) * quantity
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  itemTotal: number;

  // Special instructions for this specific item
  @Column({ nullable: true })
  itemNotes: string;
}
