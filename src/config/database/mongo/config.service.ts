import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
/**
 * Service dealing with mongo config based operations.
 *
 * @class
 */
@Injectable()
export class MongoConfigService {
  constructor(private configService: ConfigService) {}

  get database(): string {
    return this.configService.get<string>("mongo.database");
  }
  get password(): string {
    return this.configService.get<string>("mongo.password");
  }
  get username(): string {
    return this.configService.get<string>("mongo.username");
  }
  get port(): string {
    return this.configService.get<string>("mongo.port");
  }
  get host(): string {
    return this.configService.get<string>("mongo.host");
  }
}
