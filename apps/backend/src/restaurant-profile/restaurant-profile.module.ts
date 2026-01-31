import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantProfileController } from './restaurant-profile.controller';
import { RestaurantProfileService } from './restaurant-profile.service';
import { RestaurantProfile } from './entities/restaurant-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantProfile])],
  controllers: [RestaurantProfileController],
  providers: [RestaurantProfileService],
  exports: [RestaurantProfileService],
})
export class RestaurantProfileModule {}
