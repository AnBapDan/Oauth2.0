import { Module, NotAcceptableException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  imports:[],
  providers: [AuthService],
  exports:[AuthService]
})
export class AuthModule {
}
