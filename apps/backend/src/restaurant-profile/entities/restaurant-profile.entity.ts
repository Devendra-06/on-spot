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
import { FileEntity } from '../../files/infrastructure/persistence/relational/entities/file.entity';

export interface OpeningHour {
  open: string;
  close: string;
  closed?: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface HolidayClosure {
  date: string; // YYYY-MM-DD format
  reason?: string;
}

export interface SpecialHour {
  date: string; // YYYY-MM-DD format
  open: string;
  close: string;
  reason?: string;
}

@Entity()
export class RestaurantProfile extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'My Restaurant' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'jsonb', default: '{}' })
  openingHours: Record<string, OpeningHour>;

  @Column({ type: 'jsonb', default: '{}' })
  socialLinks: SocialLinks;

  @Column({ type: 'jsonb', default: '[]' })
  holidayClosures: HolidayClosure[];

  @Column({ type: 'jsonb', default: '[]' })
  specialHours: SpecialHour[];

  @ManyToOne(() => FileEntity, { eager: true, nullable: true })
  @JoinColumn()
  logo?: FileEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
