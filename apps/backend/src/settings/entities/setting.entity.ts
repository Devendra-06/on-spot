import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';

@Entity()
export class Setting extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Foodly' })
  siteName: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: '$' })
  currencySymbol: string;

  @Column('decimal', { precision: 10, scale: 2, default: 5.0 })
  deliveryFee: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minimumOrder: number;

  @Column({ default: false })
  maintenanceMode: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
