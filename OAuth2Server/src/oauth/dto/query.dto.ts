import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDto {

  @IsString()
  @IsNotEmpty()
  response_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}