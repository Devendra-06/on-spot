import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuVariant } from './entities/menu-variant.entity';
import { MenuAddon } from './entities/menu-addon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuVariant, MenuAddon])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
