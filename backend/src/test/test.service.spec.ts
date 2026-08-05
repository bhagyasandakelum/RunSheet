import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TestService', () => {
  let service: TestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
