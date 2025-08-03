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
import { ChercheurComponent } from './chercheur/chercheur/chercheur.component';
import { AnalyseComponent } from './chercheur/analyse/analyse.component';
import { ComparesourcesComponent } from './chercheur/comparesources/comparesources.component';
import { StatistiqueComponent } from './chercheur/statistique/statistique.component';
import { AdminComponent } from './admin/admin/admin.component';


const routes: Routes = [  
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {path:'accueil',component:AccueilComponent},
  {path:'connexion',component:LoginComponent},
  {path:'inscription',component:RegisterComponent},

  {path: 'admin', component:AdminComponent,
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {path : 'chercheur', component:ChercheurhomeComponent,
    children :[
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      {path:'accueil',component:ChercheurComponent},
      {path:'analyse',component:AnalyseComponent},
      {path:'sources',component:ComparesourcesComponent},
      {path:'statistiques',component:StatistiqueComponent},

    ],
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
