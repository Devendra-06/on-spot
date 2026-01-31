import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddressesService } from './user-addresses.service';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddress } from './entities/user-address.entity';
import { DeliveryZonesModule } from '../delivery-zones/delivery-zones.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress]), DeliveryZonesModule],
  controllers: [UserAddressesController],
  providers: [UserAddressesService],
  exports: [UserAddressesService],
})
export class UserAddressesModule {}
