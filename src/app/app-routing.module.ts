import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminhomeComponent } from './admin/adminhome/adminhome.component';
import { ChercheurhomeComponent } from './chercheur/chercheurhome/chercheurhome.component';
import { EtudianthomeComponent } from './etudiant/etudianthome/etudianthome.component';
import { authGuard } from './auth/auth.guard';

const routes: Routes = [  
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {path:'accueil',component:AccueilComponent},
  {path:'connexion',component:LoginComponent},
  {path:'inscription',component:RegisterComponent},

  {path: 'admin', component:AdminhomeComponent,
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {path : 'chercheur', component:ChercheurhomeComponent,
    canActivate: [authGuard],
    data: { role: 'Chercheur' }
  },
  {path : 'etudiant', component: EtudianthomeComponent,
    canActivate: [authGuard],
    data: { role: 'Etudiant' }
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
