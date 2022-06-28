import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';

@Module({
  imports:[AuthModule],
  providers: [OauthService],
  controllers: [OauthController]
})
export class OauthModule {}
