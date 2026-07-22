import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Footer } from '../../components/footer/footer';

interface Faq {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly openFaq = signal<number | null>(0);

  protected readonly faqs: Faq[] = [
    {
      pregunta: '¿Cómo reservo un turno?',
      respuesta:
        'Elegís el servicio, seleccionás el día y horario disponible y confirmás la reserva. Todo el proceso lleva menos de un minuto y recibís la confirmación al instante.',
    },
    {
      pregunta: '¿Puedo cancelar o reprogramar un turno?',
      respuesta:
        'Sí. Desde la sección "Mis turnos" podés cancelar o reprogramar tus reservas activas sin costo, siempre que lo hagas con anticipación.',
    },
    {
      pregunta: '¿Necesito crear una cuenta para reservar?',
      respuesta:
        'Sí, con una cuenta gratuita podés reservar, ver tu historial de turnos y recibir recordatorios. Crearla lleva menos de un minuto.',
    },
    {
      pregunta: '¿Argenda es solo para servicios de estética?',
      respuesta:
        'No. Argenda está pensada para cualquier profesional o centro que trabaje con turnos: estética, salud, consultorios, estudios y más.',
    },
    {
      pregunta: '¿Qué pasa si el profesional no está disponible?',
      respuesta:
        'La agenda muestra únicamente los horarios libres en tiempo real, por lo que nunca vas a poder reservar un horario ya ocupado.',
    },
  ];

  protected toggleFaq(index: number): void {
    this.openFaq.update((open) => (open === index ? null : index));
  }
}
