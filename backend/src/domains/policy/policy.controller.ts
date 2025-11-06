import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PolicyService } from './policy.service';
import { PurchaseInsuranceDto } from './dto/purchase-insurance.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('insurance')
@Controller('insurance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  /**
   * POST /api/insurance/purchase
   * Purchase a new insurance policy
   */
  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Purchase insurance policy',
    description:
      'Create a new insurance policy. Automatically creates customer record, policy, and payment entry. Requires a valid plan ID from seed data.',
  })
  @ApiBody({ type: PurchaseInsuranceDto })
  @ApiResponse({
    status: 201,
    description:
      'Policy purchased successfully. Returns policy number, customer, plan, and payment details.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Customer already exists and linked to another user' })
  purchaseInsurance(@CurrentUser() user: any, @Body() purchaseDto: PurchaseInsuranceDto) {
    return this.policyService.purchaseInsurance(user.id, purchaseDto);
  }

  /**
   * POST /api/insurance/:policyNumber/renew
   * Renew an existing insurance policy (extends end date by 1 year)
   */
  @Post(':policyNumber/renew')
  @ApiOperation({
    summary: 'Renew insurance policy',
    description:
      'Extend policy end date by 1 year using policy number. Creates renewal record and payment entry. User can only renew their own policies.',
  })
  @ApiParam({
    name: 'policyNumber',
    description: 'Policy Number (e.g., POL-1731234567890-ABCD1234)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description:
      'Policy renewed successfully. Returns updated policy, renewal record, and payment details.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Policy belongs to another user' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  renewInsurance(@CurrentUser() user: any, @Param('policyNumber') policyNumber: string) {
    return this.policyService.renewInsuranceByPolicyNumber(user.id, policyNumber);
  }

  /**
   * POST /api/insurance/:policyNumber/cancel
   * Cancel an insurance policy
   */
  @Post(':policyNumber/cancel')
  @ApiOperation({
    summary: 'Cancel insurance policy',
    description:
      'Cancel an active policy using policy number. Creates cancellation request and updates policy status to cancelled. User can only cancel their own policies.',
  })
  @ApiParam({
    name: 'policyNumber',
    description: 'Policy Number (e.g., POL-1731234567890-ABCD1234)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Policy cancelled successfully. Returns updated policy and cancellation request.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Policy belongs to another user' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  cancelInsurance(@CurrentUser() user: any, @Param('policyNumber') policyNumber: string) {
    return this.policyService.cancelInsuranceByPolicyNumber(user.id, policyNumber);
  }

  /**
   * GET /api/insurance
   * Get all insurance policies for the current user
   */
  @Get()
  @ApiOperation({
    summary: 'Get all user policies',
    description:
      'Retrieve all insurance policies for the authenticated user. Returns policies with populated customer, plan, and agent details.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Policies retrieved successfully. Returns array of policy objects with relationships.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  getInsurance(@CurrentUser() user: any) {
    return this.policyService.getInsurance(user.id);
  }

  /**
   * GET /api/insurance/:policyNumber
   * Get a specific insurance policy by Policy Number
   */
  @Get(':policyNumber')
  @ApiOperation({
    summary: 'Get policy by Policy Number',
    description:
      'Retrieve detailed information for a specific policy by its policy number (e.g., POL-1234567890-ABC). Returns policy details including all payments, renewals, and cancellation requests. User can only view their own policies.',
  })
  @ApiParam({
    name: 'policyNumber',
    description: 'Policy Number (e.g., POL-1234567890-ABC)',
    type: String,
    example: 'POL-1731234567890-ABCD1234',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy details retrieved successfully. Returns complete policy history.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Policy belongs to another user (access denied)',
  })
  @ApiResponse({ status: 404, description: 'Policy not found with the given policy number' })
  getInsuranceByPolicyNumber(
    @CurrentUser() user: any,
    @Param('policyNumber') policyNumber: string,
  ) {
    return this.policyService.getInsuranceByPolicyNumber(user.id, policyNumber);
  }
}
