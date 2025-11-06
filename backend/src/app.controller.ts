import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiDocumentation() {
    return this.appService.getApiDocumentation();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
