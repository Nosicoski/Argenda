import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface BookingService {
  id: number;
  name: string;
  duration: string;
  price: number;
}

@Component({
  selector: 'app-booking',
  imports: [FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking {
  currentStep = 1;

  selectedServiceId: number | null = null;
  selectedDate = '';
  selectedTime = '';

  bookingConfirmed = false;

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

  get selectedService(): BookingService | undefined {
    return this.services.find(
      service => service.id === this.selectedServiceId
    );
  }

  selectService(serviceId: number): void {
    this.selectedServiceId = serviceId;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  nextStep(): void {
    if (
      this.currentStep === 1 &&
      this.selectedServiceId !== null
    ) {
      this.currentStep = 2;
      return;
    }

    if (
      this.currentStep === 2 &&
      this.selectedDate &&
      this.selectedTime
    ) {
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  confirmBooking(): void {
    const appointment = {
      id: Date.now(),
      service: this.selectedService?.name,
      duration: this.selectedService?.duration,
      price: this.selectedService?.price,
      date: this.selectedDate,
      time: this.selectedTime,
      status: 'Confirmado'
    };

    const appointments = JSON.parse(
      localStorage.getItem('argenda_appointments') || '[]'
    );

    appointments.push(appointment);

    localStorage.setItem(
      'argenda_appointments',
      JSON.stringify(appointments)
    );

    this.bookingConfirmed = true;
  }
}