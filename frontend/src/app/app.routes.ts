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
  { path: 'home', component: FighterLandingComponent, title: 'Pixel Arena — Create & Battle Pixel Fighters' },
  { path: 'fighter/:name', component: FighterProfileComponent, title: 'Fighter Profile — Pixel Arena' },
  { path: 'battle/:matchId', component: BattleArenaComponent, title: 'Battle — Pixel Arena' },
  { path: 'leaderboard', component: LeaderboardComponent, title: 'Leaderboard — Pixel Arena' },

  // Baby shower (existing)
  { path: 'retro/invite/:id', component: GameComponent, title: "A Boy Story — Andy's Baby Shower" },
  { path: 'toystory/invite/:id', component: ToyGameComponent, title: "A Boy Story — Andy's Baby Shower" },
  { path: 'invite/:id', redirectTo: '/toystory/invite/:id', pathMatch: 'full' },

  // Admin (existing)
  { path: 'login', component: LoginComponent, title: 'Admin Login — andyamat.com' },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard], title: 'Admin — andyamat.com' },
];
