import { Module } from "@nestjs/common";
import { GroupsSeedService } from "./seed.service";

@Module({
  providers: [GroupsSeedService],
})
export class GroupsSeedModule {}
