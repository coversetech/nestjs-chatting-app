import { Test, TestingModule } from '@nestjs/testing';
import { MessagesSeedService } from './seed.service';

describe('MessagesSeedService', () => {
  let service: MessagesSeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesSeedService],
    }).compile();

    service = module.get<MessagesSeedService>(MessagesSeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
