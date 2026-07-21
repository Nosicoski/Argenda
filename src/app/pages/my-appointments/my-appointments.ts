import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

interface Appointment {
  id: number;
  userEmail: string;
  serviceId?: number;
  service: string;
  duration: string;
  price: number;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-my-appointments',
  imports: [RouterLink],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {

  appointments: Appointment[] = [];

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.appointments = [];
      return;
    }

    const allAppointments = this.getStoredAppointments();

    this.appointments = allAppointments
      .filter(
        appointment =>
          appointment.userEmail === currentUser.email
      )
      .sort((firstAppointment, secondAppointment) => {
        const firstDateTime = new Date(
          `${firstAppointment.date}T${firstAppointment.time}`
        ).getTime();

        const secondDateTime = new Date(
          `${secondAppointment.date}T${secondAppointment.time}`
        ).getTime();

        return firstDateTime - secondDateTime;
      });
  }

  cancelAppointment(id: number): void {
    const confirmed = confirm(
      '¿Seguro que querés cancelar este turno?'
    );

    if (!confirmed) {
      return;
    }

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    const allAppointments = this.getStoredAppointments();

    const updatedAppointments = allAppointments.filter(
      appointment =>
        !(
          appointment.id === id &&
          appointment.userEmail === currentUser.email
        )
    );

    localStorage.setItem(
      'argenda_appointments',
      JSON.stringify(updatedAppointments)
    );

    this.loadAppointments();
  }

  formatDate(date: string): string {
    if (!date) {
      return '';
    }

    const [year, month, day] = date.split('-');

    return `${day}/${month}/${year}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(price);
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
    } catch (error) {
      console.error(
        'No se pudieron leer los turnos guardados:',
        error
      );

      return [];
    }
  }
}