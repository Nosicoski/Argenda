import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

interface BookingService {
  id: number;
  name: string;
  duration: string;
  price: number;
}

interface BookingDay {
  fecha: string;
  weekday: string;
  dayNumber: string;
  off: boolean;
  past: boolean;
}

type SlotState = 'free' | 'occupied' | 'past';

const WEEKDAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

const WEEKDAY_SHORT = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb'
];

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

interface Appointment {
  id: number;
  userEmail: string;
  serviceId: number;
  service: string;
  duration: string;
  price: number;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-booking',
  imports: [
    RouterLink
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking {

  currentStep = 1;

  selectedServiceId: number | null = null;
  selectedDate = '';
  selectedTime = '';

  weekOffset = 0;
  readonly maxWeekOffset = 3;

  bookingConfirmed = false;
  isSaving = false;

  dateTouched = false;
  timeTouched = false;

  bookingError = '';

  services: BookingService[] = [
    {
      id: 1,
      name: 'Limpieza facial',
      duration: '60 minutos',
      price: 25000
    },
    {
      id: 2,
      name: 'Manicura',
      duration: '45 minutos',
      price: 18000
    },
    {
      id: 3,
      name: 'Masaje relajante',
      duration: '60 minutos',
      price: 30000
    }
  ];

  constructor(
    private agenda: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  get selectedService(): BookingService | undefined {
    return this.services.find(
      service => service.id === this.selectedServiceId
    );
  }

  get minDate(): string {
    /*
     * "Hoy" sale de los datos mockeados de la agenda para que
     * la disponibilidad quede sincronizada con el panel.
     */
    return this.agenda.hoy;
  }

  // =========================
  // Semana visible (paso 2)
  // =========================

  get weekDays(): BookingDay[] {
    const monday = this.parseDate(this.agenda.hoy);

    monday.setDate(
      monday.getDate() + this.weekOffset * 7
    );

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);

      const fecha = this.toIso(day);

      return {
        fecha,
        weekday: WEEKDAY_SHORT[day.getDay()],
        dayNumber: String(day.getDate()).padStart(2, '0'),
        off: day.getDay() === 0,
        past: fecha < this.agenda.hoy
      };
    });
  }

  get monthLabel(): string {
    const days = this.weekDays;

    const first = this.parseDate(days[0].fecha);
    const last = this.parseDate(days[6].fecha);

    const firstMonth = MONTH_NAMES[first.getMonth()];
    const lastMonth = MONTH_NAMES[last.getMonth()];

    if (firstMonth === lastMonth) {
      return `${this.capitalize(firstMonth)} ${first.getFullYear()}`;
    }

    return `${this.capitalize(firstMonth)} · ${this.capitalize(lastMonth)} ${last.getFullYear()}`;
  }

  get professional(): string {
    return this.agenda.profesional;
  }

  get morningTimes(): string[] {
    return this.agenda.horarios.filter(
      hora => hora < '13:00'
    );
  }

  get afternoonTimes(): string[] {
    return this.agenda.horarios.filter(
      hora => hora >= '13:00'
    );
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) {
      return '';
    }

    const date = this.parseDate(this.selectedDate);

    const weekday = WEEKDAY_NAMES[date.getDay()];
    const month = MONTH_NAMES[date.getMonth()];

    return `${weekday}, ${date.getDate()} de ${month} de ${date.getFullYear()}`;
  }

  previousWeek(): void {
    if (this.weekOffset > 0) {
      this.weekOffset--;
    }
  }

  nextWeek(): void {
    if (this.weekOffset < this.maxWeekOffset) {
      this.weekOffset++;
    }
  }

  selectDay(day: BookingDay): void {
    if (day.off || day.past) {
      return;
    }

    this.selectedDate = day.fecha;
    this.dateTouched = true;

    /*
     * Cuando cambia la fecha, limpiamos el horario anterior
     * para evitar reservar accidentalmente un horario viejo.
     */
    this.selectedTime = '';
    this.timeTouched = false;
    this.bookingError = '';
  }

  slotState(time: string): SlotState {
    if (!this.selectedDate) {
      return 'free';
    }

    if (
      this.agenda.ocupado(this.selectedDate, time) ||
      this.isTimeUnavailable(time)
    ) {
      return 'occupied';
    }

    if (
      this.selectedDate === this.agenda.hoy &&
      time <= this.agenda.ahora
    ) {
      return 'past';
    }

    return 'free';
  }

  get dateIsInvalid(): boolean {
    if (!this.selectedDate) {
      return true;
    }

    return this.selectedDate < this.minDate;
  }

  get canContinueDateStep(): boolean {
    return !this.dateIsInvalid && this.selectedTime !== '';
  }

  selectService(serviceId: number): void {
    this.selectedServiceId = serviceId;
    this.bookingError = '';
  }

  selectTime(time: string): void {
    if (this.slotState(time) !== 'free') {
      return;
    }

    this.selectedTime = time;
    this.timeTouched = true;
    this.bookingError = '';
  }

  nextStep(): void {
    this.bookingError = '';

    if (this.currentStep === 1) {
      if (this.selectedServiceId === null) {
        this.bookingError = 'Seleccioná un servicio para continuar.';
        return;
      }

      if (!this.selectedDate) {
        this.selectedDate = this.agenda.hoy;
      }

      this.currentStep = 2;
      return;
    }

    if (this.currentStep === 2) {
      this.dateTouched = true;
      this.timeTouched = true;

      if (!this.selectedDate) {
        this.bookingError = 'Seleccioná una fecha para continuar.';
        return;
      }

      if (this.dateIsInvalid) {
        this.bookingError =
          'La fecha elegida no puede ser anterior al día de hoy.';
        return;
      }

      if (!this.selectedTime) {
        this.bookingError = 'Seleccioná un horario para continuar.';
        return;
      }

      this.currentStep = 3;
    }
  }

  previousStep(): void {
    this.bookingError = '';

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmBooking(): void {
    if (this.isSaving) {
      return;
    }

    this.bookingError = '';

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.bookingError =
        'Necesitás iniciar sesión antes de confirmar el turno.';

      return;
    }

    if (!this.selectedService) {
      this.bookingError =
        'El servicio seleccionado no es válido. Volvé a elegirlo.';

      return;
    }

    if (!this.selectedDate || this.dateIsInvalid) {
      this.bookingError = 'La fecha seleccionada no es válida.';
      return;
    }

    if (!this.selectedTime) {
      this.bookingError = 'Seleccioná un horario.';
      return;
    }

    this.isSaving = true;

    try {
      const appointments = this.getStoredAppointments();

      const duplicatedAppointment = appointments.some(
        appointment =>
          appointment.userEmail === currentUser.email &&
          appointment.date === this.selectedDate &&
          appointment.time === this.selectedTime &&
          appointment.status !== 'Cancelado'
      );

      if (duplicatedAppointment) {
        this.bookingError =
          'Ya tenés un turno reservado en esa fecha y horario.';

        this.isSaving = false;
        return;
      }

      const appointment: Appointment = {
        id: Date.now(),
        userEmail: currentUser.email,
        serviceId: this.selectedService.id,
        service: this.selectedService.name,
        duration: this.selectedService.duration,
        price: this.selectedService.price,
        date: this.selectedDate,
        time: this.selectedTime,
        status: 'Confirmado'
      };

      appointments.push(appointment);

      localStorage.setItem(
        'argenda_appointments',
        JSON.stringify(appointments)
      );

      // La reserva también se refleja en la agenda del profesional
      this.agenda.agregarReserva({
        fecha: this.selectedDate,
        hora: this.selectedTime,
        cliente: currentUser.name,
        servicio: this.selectedService.name
      });

      this.bookingConfirmed = true;
    } catch (error) {
      console.error('Error al guardar el turno:', error);

      this.bookingError =
        'No pudimos guardar el turno. Intentá nuevamente.';
    } finally {
      this.isSaving = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/iniciar-sesion']);
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) {
      return '';
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: string): string {
    if (!date) {
      return '';
    }

    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  }

  private getStoredAppointments(): Appointment[] {
    const storedAppointments =
      localStorage.getItem('argenda_appointments');

    if (!storedAppointments) {
      return [];
    }

    try {
      const appointments = JSON.parse(storedAppointments);

      return Array.isArray(appointments)
        ? appointments
        : [];
    } catch {
      return [];
    }
  }
  isTimeUnavailable(time: string): boolean {
    if (!this.selectedDate) {
      return false;
    }

    const appointments = this.getStoredAppointments();

    return appointments.some(
      appointment =>
        appointment.date === this.selectedDate &&
        appointment.time === time &&
        appointment.status !== 'Cancelado'
    );
  }

  // =========================
  // Helpers de fechas
  // =========================

  private parseDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}