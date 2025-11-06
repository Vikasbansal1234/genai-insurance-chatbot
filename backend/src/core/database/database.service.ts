import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../domains/auth/models/user.entity';
import { Policy } from '../../domains/policy/models/policy.entity';
import * as bcrypt from 'bcrypt';
import { PdfEmbedding } from '../../domains/pdf/models/embedding.entity';
@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<any>,
    @InjectModel(Policy.name) private policyModel: Model<any>,
    @InjectModel(PdfEmbedding.name) private pdfEmbeddingModel: Model<PdfEmbedding>,
  ) {}

  async onModuleInit() {
    await this.seedInitialData();
  }

  /**
   * Get the User model
   */
  getUserModel(): Model<any> {
    return this.userModel;
  }

  /**
   * Get the Policy model
   */
  getPolicyModel(): Model<any> {
    return this.policyModel;
  }

  /**
   * Seed initial data for testing
   */
  private async seedInitialData() {
    try {
      // Seed admin user if not exists
      const adminExists = await this.userModel.findOne({ email: 'admin@example.com' });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await this.userModel.create({
          email: 'admin@example.com',
          password: hashedPassword,
          username: 'admin',
          role: 'admin',
        });
      }
    } catch (error) {
      // Error seeding data
    }
  }
}
