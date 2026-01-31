import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { CreateAddonDto, UpdateAddonDto } from './dto/create-addon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuVariant } from './entities/menu-variant.entity';
import { MenuAddon } from './entities/menu-addon.entity';
import { Repository, LessThanOrEqual, MoreThan, In } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuVariant)
    private readonly variantRepository: Repository<MenuVariant>,
    @InjectRepository(MenuAddon)
    private readonly addonRepository: Repository<MenuAddon>,
  ) {}

  create(createMenuDto: CreateMenuDto) {
    return this.menuRepository.save(this.menuRepository.create(createMenuDto));
  }

  findAll() {
    return this.menuRepository.find({
      relations: ['photo', 'category', 'variants', 'addons'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  findAvailable() {
    return this.menuRepository.find({
      where: { isAvailable: true },
      relations: ['photo', 'category', 'variants', 'addons'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.menuRepository.findOne({
      where: { id },
      relations: ['photo', 'category', 'variants', 'addons'],
    });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Handle variants update separately if provided
    const { variants, addons, ...menuData } = updateMenuDto;

    await this.menuRepository.update(id, menuData);

    return this.findOne(id);
  }

  remove(id: string) {
    return this.menuRepository.softDelete(id);
  }

  // Availability management
  async updateAvailability(id: string, isAvailable: boolean) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    await this.menuRepository.update(id, { isAvailable });
    return this.findOne(id);
  }

  // Stock management
  async updateStock(id: string, stockQuantity: number | null) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    const updateData: Partial<Menu> = { stockQuantity };

    // Auto-disable if stock hits zero and autoDisableOnStockout is enabled
    if (
      stockQuantity !== null &&
      stockQuantity <= 0 &&
      menu.autoDisableOnStockout
    ) {
      updateData.isAvailable = false;
    }

    await this.menuRepository.update(id, updateData);
    return this.findOne(id);
  }

  // Get low stock items
  async getLowStockItems() {
    const menus = await this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.stockQuantity IS NOT NULL')
      .andWhere('menu.stockQuantity <= menu.lowStockThreshold')
      .andWhere('menu.deletedAt IS NULL')
      .leftJoinAndSelect('menu.photo', 'photo')
      .leftJoinAndSelect('menu.category', 'category')
      .orderBy('menu.stockQuantity', 'ASC')
      .getMany();

    return menus;
  }

  // Sort order management
  async updateSortOrder(items: { id: string; sortOrder: number }[]) {
    const updates = items.map((item) =>
      this.menuRepository.update(item.id, { sortOrder: item.sortOrder }),
    );
    await Promise.all(updates);
    return { success: true };
  }

  // ==================== VARIANTS ====================

  async createVariant(menuId: string, createVariantDto: CreateVariantDto) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${menuId} not found`);
    }

    const variant = this.variantRepository.create({
      ...createVariantDto,
      menuId,
    });

    return this.variantRepository.save(variant);
  }

  async updateVariant(
    menuId: string,
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, menuId },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found for menu ${menuId}`,
      );
    }

    await this.variantRepository.update(variantId, updateVariantDto);
    return this.variantRepository.findOne({ where: { id: variantId } });
  }

  async deleteVariant(menuId: string, variantId: string) {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, menuId },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variant with ID ${variantId} not found for menu ${menuId}`,
      );
    }

    await this.variantRepository.delete(variantId);
    return { success: true };
  }

  async getVariants(menuId: string) {
    return this.variantRepository.find({
      where: { menuId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  // ==================== ADDONS ====================

  async createAddon(menuId: string, createAddonDto: CreateAddonDto) {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${menuId} not found`);
    }

    const addon = this.addonRepository.create({
      ...createAddonDto,
      menuId,
    });

    return this.addonRepository.save(addon);
  }

  async updateAddon(
    menuId: string,
    addonId: string,
    updateAddonDto: UpdateAddonDto,
  ) {
    const addon = await this.addonRepository.findOne({
      where: { id: addonId, menuId },
    });

    if (!addon) {
      throw new NotFoundException(
        `Addon with ID ${addonId} not found for menu ${menuId}`,
      );
    }

    await this.addonRepository.update(addonId, updateAddonDto);
    return this.addonRepository.findOne({ where: { id: addonId } });
  }

  async deleteAddon(menuId: string, addonId: string) {
    const addon = await this.addonRepository.findOne({
      where: { id: addonId, menuId },
    });

    if (!addon) {
      throw new NotFoundException(
        `Addon with ID ${addonId} not found for menu ${menuId}`,
      );
    }

    await this.addonRepository.delete(addonId);
    return { success: true };
  }

  async getAddons(menuId: string) {
    return this.addonRepository.find({
      where: { menuId },
      order: { groupName: 'ASC', sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  // Bulk operations for stock
  async bulkUpdateStock(
    items: { id: string; stockQuantity: number | null }[],
  ) {
    const results: (Menu | null)[] = [];
    for (const item of items) {
      const result = await this.updateStock(item.id, item.stockQuantity);
      results.push(result);
    }
    return results;
  }
}
