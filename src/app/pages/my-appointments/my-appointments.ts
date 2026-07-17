import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Appointment {
  id: number;
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

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const storedAppointments = localStorage.getItem('argenda_appointments');

    this.appointments = storedAppointments
      ? JSON.parse(storedAppointments)
      : [];
  }

  cancelAppointment(id: number): void {
    const confirmed = confirm(
      '¿Seguro que querés cancelar este turno?'
    );

    if (!confirmed) {
      return;
    }

    this.appointments = this.appointments.filter(
      appointment => appointment.id !== id
    );

    localStorage.setItem(
      'argenda_appointments',
      JSON.stringify(this.appointments)
    );
  }
}