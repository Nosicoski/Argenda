import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

interface BookingService {
  id: number;
  name: string;
  duration: string;
  price: number;
}

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
    FormsModule,
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

  availableTimes: string[] = [
    '09:00',
    '10:30',
    '12:00',
    '15:00',
    '16:30',
    '18:00'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get selectedService(): BookingService | undefined {
    return this.services.find(
      service => service.id === this.selectedServiceId
    );
  }

  get minDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
  if (this.isTimeUnavailable(time)) {
    return;
  }

  this.selectedTime = time;
  this.timeTouched = true;
  this.bookingError = '';
}
  onDateChange(): void {
    this.dateTouched = true;

    /*
     * Cuando cambia la fecha, limpiamos el horario anterior
     * para evitar reservar accidentalmente un horario viejo.
     */
  this.selectedTime = '';
  this.timeTouched = false;
  this.bookingError = '';
  }

  nextStep(): void {
    this.bookingError = '';

    if (this.currentStep === 1) {
      if (this.selectedServiceId === null) {
        this.bookingError = 'Seleccioná un servicio para continuar.';
        return;
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
}