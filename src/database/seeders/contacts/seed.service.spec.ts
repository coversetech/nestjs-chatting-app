import { Test, TestingModule } from "@nestjs/testing";
import { ContactsSeedService } from "./seed.service";

describe("ContactsSeedService", () => {
  let service: ContactsSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsSeedService],
    }).compile();

    service = module.get<ContactsSeedService>(ContactsSeedService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
