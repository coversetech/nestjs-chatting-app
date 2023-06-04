import { Test, TestingModule } from "@nestjs/testing";
import { UsersSeedService } from "./seed.service";

describe("UsersSeedService", () => {
  let service: UsersSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersSeedService],
    }).compile();

    service = module.get<UsersSeedService>(UsersSeedService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
