import { Test, TestingModule } from '@nestjs/testing';
import { GroupsSeedService } from './seed.service';

describe('GroupsSeedService', () => {
  let service: GroupsSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsSeedService],
    }).compile();

    service = module.get<GroupsSeedService>(GroupsSeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
