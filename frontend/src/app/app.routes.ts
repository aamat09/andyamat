import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { ToyGameComponent } from './toy-game/toy-game.component';

export const routes: Routes = [
  { path: 'retro/invite/:id', component: GameComponent },
  { path: 'toystory/invite/:id', component: ToyGameComponent },
  { path: 'invite/:id', redirectTo: '/toystory/invite/:id', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
