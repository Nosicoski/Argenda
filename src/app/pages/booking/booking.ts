import { Component } from '@angular/core';

interface BookingService {
  id: number;
  name: string;
  duration: string;
  price: number;
}

@Component({
  selector: 'app-booking',
  imports: [],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking {
  selectedServiceId: number | null = null;

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

  selectService(serviceId: number): void {
    this.selectedServiceId = serviceId;
  }
}