import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';
import { Category } from '../../categories/entities/category.entity';
import { MenuVariant } from './menu-variant.entity';
import { MenuAddon } from './menu-addon.entity';

@Entity()
export class Menu extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  photo?: FileEntity | null;

  @ManyToOne(() => Category, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category | null;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', nullable: true })
  stockQuantity: number | null;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @Column({ default: true })
  autoDisableOnStockout: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => MenuVariant, (variant) => variant.menu, {
    cascade: true,
    eager: true,
  })
  variants: MenuVariant[];

  @OneToMany(() => MenuAddon, (addon) => addon.menu, {
    cascade: true,
    eager: true,
  })
  addons: MenuAddon[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
