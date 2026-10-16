import { AppError } from '../../shared/errors/app-error';
import { ICollectionPointsRepository } from '../collection-points/collection-points.repository';
import {
  CreateScheduleInput,
  ScheduleStatus,
} from './dto/create-schedule.dto';
import {
  ISchedulesRepository,
  ScheduleItem,
} from './schedules.repository';

export class SchedulesService {
  constructor(
    private readonly schedulesRepo: ISchedulesRepository,
    private readonly pointsRepo: ICollectionPointsRepository
  ) {}

  async createSchedule(data: CreateScheduleInput): Promise<ScheduleItem> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = data.scheduled_date.split('-').map(Number);
    const scheduledDate = new Date(year, month - 1, day);
    scheduledDate.setHours(0, 0, 0, 0);

    if (isNaN(scheduledDate.getTime())) {
      throw AppError.badRequest(
        'Data informada é inválida.',
        'https://api.ecoroute.com/errors/invalid-date'
      );
    }

    if (scheduledDate < today) {
      throw AppError.badRequest(
        'A data do agendamento não pode ser anterior à data de hoje.',
        'https://api.ecoroute.com/errors/past-date'
      );
    }

    const point = await this.pointsRepo.findById(data.collection_point_id);
    if (!point || !point.is_active) {
      throw AppError.notFound(
        `Ponto de coleta '${data.collection_point_id}' não foi encontrado ou está inativo.`,
        'https://api.ecoroute.com/errors/point-not-found'
      );
    }

    const normalizedCategory = data.waste_category.trim().toUpperCase();
    const isCategoryAccepted = point.accepted_categories.some(
      (cat) => cat.trim().toUpperCase() === normalizedCategory
    );

    if (!isCategoryAccepted) {
      throw AppError.badRequest(
        `O ponto de coleta '${point.name}' não aceita a categoria de resíduo '${data.waste_category}'. Categorias aceitas: ${point.accepted_categories.join(', ')}.`,
        'https://api.ecoroute.com/errors/unsupported-waste-category'
      );
    }

    const activeSchedulesCount =
      await this.schedulesRepo.countActiveByPointAndDate(
        point.id,
        data.scheduled_date
      );

    if (activeSchedulesCount >= point.max_daily_capacity) {
      throw AppError.conflict(
        `O ponto de coleta atingiu sua capacidade máxima de ${point.max_daily_capacity} agendamentos para a data ${data.scheduled_date}.`,
        'https://api.ecoroute.com/errors/capacity-exceeded'
      );
    }

    return this.schedulesRepo.create({
      collection_point_id: point.id,
      user_name: data.user_name.trim(),
      user_email: data.user_email.trim().toLowerCase(),
      scheduled_date: data.scheduled_date,
      waste_category: normalizedCategory,
      items_description: data.items_description.trim(),
    });
  }

  async updateStatus(id: string, newStatus: ScheduleStatus): Promise<ScheduleItem> {
    const existing = await this.schedulesRepo.findById(id);
    if (!existing) {
      throw AppError.notFound(
        `Agendamento com ID '${id}' não foi encontrado.`,
        'https://api.ecoroute.com/errors/schedule-not-found'
      );
    }

    this.validateStatusTransition(existing.status, newStatus);

    return this.schedulesRepo.updateStatus(id, newStatus);
  }

  async deleteSchedule(id: string): Promise<void> {
    const deleted = await this.schedulesRepo.delete(id);
    if (!deleted) {
      throw AppError.notFound(
        `Agendamento com ID '${id}' não foi encontrado.`,
        'https://api.ecoroute.com/errors/schedule-not-found'
      );
    }
  }

  async getScheduleById(id: string): Promise<ScheduleItem> {
    const schedule = await this.schedulesRepo.findById(id);
    if (!schedule) {
      throw AppError.notFound(
        `Agendamento com ID '${id}' não foi encontrado.`,
        'https://api.ecoroute.com/errors/schedule-not-found'
      );
    }
    return schedule;
  }

  async listSchedules(filter?: {
    collection_point_id?: string;
    scheduled_date?: string;
    status?: ScheduleStatus;
  }): Promise<ScheduleItem[]> {
    return this.schedulesRepo.list(filter);
  }

  private validateStatusTransition(
    currentStatus: ScheduleStatus,
    newStatus: ScheduleStatus
  ): void {
    if (currentStatus === newStatus) {
      return;
    }

    if (currentStatus === 'CANCELLED') {
      throw AppError.badRequest(
        `Não é permitida a transição de estado de '${currentStatus}' para '${newStatus}'.`,
        'https://api.ecoroute.com/errors/invalid-status-transition'
      );
    }

    if (currentStatus === 'COMPLETED' && (newStatus === 'PENDING' || newStatus === 'CONFIRMED')) {
      throw AppError.badRequest(
        `Não é permitida a transição de um agendamento já concluído ('COMPLETED') para '${newStatus}'.`,
        'https://api.ecoroute.com/errors/invalid-status-transition'
      );
    }
  }
}
