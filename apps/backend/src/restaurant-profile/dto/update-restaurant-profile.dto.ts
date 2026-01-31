import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileDto } from '../../files/dto/file.dto';

export class OpeningHourDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  open: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  close: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  closed?: boolean;
}

export class SocialLinksDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class HolidayClosureDto {
  @ApiProperty({ example: '2026-12-25' })
  @IsString()
  date: string;

  @ApiProperty({ example: 'Christmas Day', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SpecialHourDto {
  @ApiProperty({ example: '2026-12-24' })
  @IsString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  open: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  close: string;

  @ApiProperty({ example: 'Christmas Eve - Early Close', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateRestaurantProfileDto {
  @ApiProperty({ example: 'My Restaurant', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Best food in town', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'contact@restaurant.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    example: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      sunday: { open: '10:00', close: '20:00', closed: false },
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, OpeningHourDto>;

  @ApiProperty({
    example: {
      facebook: 'https://facebook.com/myrestaurant',
      instagram: 'https://instagram.com/myrestaurant',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @ApiProperty({
    type: [HolidayClosureDto],
    example: [{ date: '2026-12-25', reason: 'Christmas Day' }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayClosureDto)
  holidayClosures?: HolidayClosureDto[];

  @ApiProperty({
    type: [SpecialHourDto],
    example: [
      { date: '2026-12-24', open: '09:00', close: '18:00', reason: 'Christmas Eve' },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialHourDto)
  specialHours?: SpecialHourDto[];

  @ApiProperty({ type: () => FileDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => FileDto)
  logo?: FileDto | null;
}
