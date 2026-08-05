import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let serviceMock: any;

  const mockUser = { userId: 'user-1' };
  const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    serviceMock = {
      getOrganizerDashboard: jest.fn(),
      getMemberDashboard: jest.fn(),
      getEventStatistics: jest.fn(),
      getTeamAnalytics: jest.fn(),
      getTaskAnalytics: jest.fn(),
      getTimeline: jest.fn(),
      getMyTasks: jest.fn(),
      getMyNotifications: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getMemberDashboard', async () => {
    serviceMock.getMemberDashboard.mockResolvedValue({ profile: {} });
    const res = await controller.getMemberDashboard(mockUser);
    expect(serviceMock.getMemberDashboard).toHaveBeenCalledWith('user-1');
    expect(res).toEqual({ profile: {} });
  });

  it('should call getMyTasks with filter DTO', async () => {
    const filter = { page: 1, limit: 10 };
    serviceMock.getMyTasks.mockResolvedValue({ data: [] });
    const res = await controller.getMyTasks(mockUser, filter);
    expect(serviceMock.getMyTasks).toHaveBeenCalledWith('user-1', filter);
    expect(res).toEqual({ data: [] });
  });

  it('should call getMyNotifications with filter DTO', async () => {
    const filter = { unreadOnly: true };
    serviceMock.getMyNotifications.mockResolvedValue({ data: [] });
    const res = await controller.getMyNotifications(mockUser, filter);
    expect(serviceMock.getMyNotifications).toHaveBeenCalledWith(
      'user-1',
      filter,
    );
    expect(res).toEqual({ data: [] });
  });

  it('should call getOrganizerDashboard', async () => {
    serviceMock.getOrganizerDashboard.mockResolvedValue({ eventSummary: {} });
    const res = await controller.getOrganizerDashboard(mockEventId, mockUser);
    expect(serviceMock.getOrganizerDashboard).toHaveBeenCalledWith(
      mockEventId,
      'user-1',
    );
    expect(res).toEqual({ eventSummary: {} });
  });

  it('should call getEventStatistics', async () => {
    serviceMock.getEventStatistics.mockResolvedValue({ events: 1 });
    const res = await controller.getEventStatistics(mockEventId, mockUser);
    expect(serviceMock.getEventStatistics).toHaveBeenCalledWith(
      mockEventId,
      'user-1',
    );
    expect(res).toEqual({ events: 1 });
  });

  it('should call getTeamAnalytics', async () => {
    serviceMock.getTeamAnalytics.mockResolvedValue([]);
    const res = await controller.getTeamAnalytics(mockEventId, mockUser);
    expect(serviceMock.getTeamAnalytics).toHaveBeenCalledWith(
      mockEventId,
      'user-1',
    );
    expect(res).toEqual([]);
  });

  it('should call getTaskAnalytics', async () => {
    serviceMock.getTaskAnalytics.mockResolvedValue({ pending: 0 });
    const res = await controller.getTaskAnalytics(mockEventId, mockUser);
    expect(serviceMock.getTaskAnalytics).toHaveBeenCalledWith(
      mockEventId,
      'user-1',
    );
    expect(res).toEqual({ pending: 0 });
  });

  it('should call getTimeline', async () => {
    serviceMock.getTimeline.mockResolvedValue([]);
    const res = await controller.getTimeline(mockEventId, mockUser);
    expect(serviceMock.getTimeline).toHaveBeenCalledWith(
      mockEventId,
      'user-1',
    );
    expect(res).toEqual([]);
  });
});
