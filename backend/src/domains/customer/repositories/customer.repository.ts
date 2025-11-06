import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../models/customer.entity';

@Injectable()
export class CustomerRepository {
  constructor(@InjectModel(Customer.name) private customerModel: Model<CustomerDocument>) {}

  async create(data: Partial<Customer>): Promise<CustomerDocument> {
    return this.customerModel.create(data);
  }

  async findById(id: string): Promise<CustomerDocument | null> {
    return this.customerModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return this.customerModel.findOne({ email }).exec();
  }

  async findAll(): Promise<CustomerDocument[]> {
    return this.customerModel.find().exec();
  }

  async update(id: string, data: Partial<Customer>): Promise<CustomerDocument | null> {
    return this.customerModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
