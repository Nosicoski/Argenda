import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface BeautyService {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-services',
  imports: [CommonModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {
services: BeautyService[] = [
    {
      id: 1,
      name: 'Limpieza facial',
      description: 'Limpieza profunda, hidratación y cuidado completo de la piel.',
      duration: '60 minutos',
      price: 25000,
      category: 'Facial',
      icon: '✨'
    },
    {
      id: 2,
      name: 'Manicura',
      description: 'Cuidado, limado y esmaltado profesional de manos y uñas.',
      duration: '45 minutos',
      price: 18000,
      category: 'Manos',
      icon: '💅'
    },
    {
      id: 3,
      name: 'Masaje relajante',
      description: 'Masaje corporal pensado para reducir tensiones y estrés.',
      duration: '60 minutos',
      price: 30000,
      category: 'Masajes',
      icon: '🌿'
    },
    {
      id: 4,
      name: 'Perfilado de cejas',
      description: 'Diseño y perfilado adaptado a la forma natural de tu rostro.',
      duration: '30 minutos',
      price: 12000,
      category: 'Facial',
      icon: '👁️'
    },
    {
      id: 5,
      name: 'Pedicura',
      description: 'Tratamiento completo para el cuidado y bienestar de tus pies.',
      duration: '50 minutos',
      price: 20000,
      category: 'Pies',
      icon: '🦶'
    },
    {
      id: 6,
      name: 'Tratamiento corporal',
      description: 'Sesión personalizada para mejorar el aspecto y la textura de la piel.',
      duration: '75 minutos',
      price: 35000,
      category: 'Corporal',
      icon: '🧴'
    }
  ];
}
