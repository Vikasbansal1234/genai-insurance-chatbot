import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../core/database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    try {
      const userModel = this.databaseService.getUserModel();

      // Check if user already exists
      const existingUser = await userModel.findOne({ email: registerDto.email });

      if (existingUser) {
        throw new ConflictException({
          success: false,
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create new user
      const newUser = await userModel.create({
        email: registerDto.email,
        password: hashedPassword,
        username: registerDto.username,
        role: registerDto.role || 'user',
      });

      // Generate JWT token
      const payload = {
        sub: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      };
      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
          },
          access_token,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to register user',
        message: error.message,
      });
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    try {
      const userModel = this.databaseService.getUserModel();
      // const policyModel = this.databaseService.getPolicyModel();

      // Find user by email
      const user = await userModel.findOne({ email: loginDto.email });

      if (!user) {
        throw new UnauthorizedException({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException({
          success: false,
          error: 'Invalid credentials',
        });
      }
      // Generate JWT token
      const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
          },
          access_token,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException({
        success: false,
        error: 'Failed to login',
        message: error.message,
      });
    }
  }

  /**
   * Validate user for JWT strategy
   */
  async validateUser(userId: string) {
    try {
      const userModel = this.databaseService.getUserModel();
      const user = await userModel.findById(userId);

      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      return null;
    }
  }
}
