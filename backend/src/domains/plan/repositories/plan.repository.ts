import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../models/plan.entity';

@Injectable()
export class PlanRepository {
  constructor(@InjectModel(Plan.name) private planModel: Model<PlanDocument>) {}

  async create(data: Partial<Plan>): Promise<PlanDocument> {
    return this.planModel.create(data);
  }

  async findById(id: string): Promise<PlanDocument | null> {
    return this.planModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<PlanDocument | null> {
    return this.planModel.findOne({ code }).exec();
  }

  async findByName(name: string): Promise<PlanDocument | null> {
    return this.planModel.findOne({ name }).exec();
  }

  async findByCategory(category: string): Promise<PlanDocument[]> {
    return this.planModel.find({ category }).exec();
  }

  async findAll(): Promise<PlanDocument[]> {
    return this.planModel.find().exec();
  }

  async update(id: string, data: Partial<Plan>): Promise<PlanDocument | null> {
    return this.planModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
