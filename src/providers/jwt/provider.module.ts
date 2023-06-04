import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtConfigModule } from "src/config/jwt/config.module";
import { JwtConfigService } from "src/config/jwt/config.service";

/**
 * Import and provide base jwt related classes.
 *
 * @module
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.secret,
        signOptions: { expiresIn: jwtConfigService.expiresIn },
      }),
      inject: [JwtConfigService],
    }),
  ],
})
export class JwtProviderModule {}
