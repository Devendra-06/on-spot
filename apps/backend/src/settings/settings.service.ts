import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async getSettings(): Promise<Setting> {
    let settings = await this.settingRepository.findOne({ where: {} });
    if (!settings) {
      settings = await this.settingRepository.save(
        this.settingRepository.create({}),
      );
    }
    return settings;
  }

  async updateSettings(updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const settings = await this.getSettings();
    this.settingRepository.merge(settings, updateSettingDto);
    return this.settingRepository.save(settings);
  }
}
