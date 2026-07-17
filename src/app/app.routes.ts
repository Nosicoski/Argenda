import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Services } from './pages/services/services';
import { Booking } from './pages/booking/booking';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MyAppointments } from './pages/my-appointments/my-appointments';

export const routes: Routes = [
{
    path: '',
    component: Home,
    title: 'Inicio | Argenda'
},
{
    path: 'servicios',
    component: Services,
    title: 'Servicios | Argenda'
},
{
    path: 'reservar',
    component: Booking,
    title: 'Reservar turno | Argenda'
},
{
    path: 'iniciar-sesion',
    component: Login,
    title: 'Iniciar sesión | Argenda'
},
{
    path: 'registro',
    component: Register,
    title: 'Registro | Argenda'
},
{
    path: 'mis-turnos',
    component: MyAppointments,
    title: 'Mis turnos | Argenda'
},
{
    path: '**',
    redirectTo: ''
}
];