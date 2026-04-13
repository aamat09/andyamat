import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { ToyGameComponent } from './toy-game/toy-game.component';
import { FighterLandingComponent } from './fighter/fighter-landing.component';
import { FighterProfileComponent } from './fighter/fighter-profile.component';
import { BattleArenaComponent } from './fighter/battle-arena.component';
import { LeaderboardComponent } from './fighter/leaderboard.component';

export const routes: Routes = [
  // Pixel Arena (landing page)
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: FighterLandingComponent },
  { path: 'fighter/:name', component: FighterProfileComponent },
  { path: 'battle/:matchId', component: BattleArenaComponent },
  { path: 'leaderboard', component: LeaderboardComponent },

  // Baby shower (existing)
  { path: 'retro/invite/:id', component: GameComponent },
  { path: 'toystory/invite/:id', component: ToyGameComponent },
  { path: 'invite/:id', redirectTo: '/toystory/invite/:id', pathMatch: 'full' },

  // Admin (existing)
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
];
