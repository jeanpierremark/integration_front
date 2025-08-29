import { Component, NgModule } from '@angular/core';
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
import { AdminComponent } from './admin/admin/admin.component';
import { RapportComponent } from './chercheur/rapport/rapport.component';
import { VisualisationComponent } from './chercheur/visualisation/visualisation.component';
import { EtudiantvisualisationComponent } from './etudiant/etudiantvisualisation/etudiantvisualisation.component';
import { EtudiantprevisionComponent } from './etudiant/etudiantprevision/etudiantprevision.component';
import { PrevisionComponent } from './chercheur/prevision/prevision.component';
import { AnalyseavanceComponent } from './chercheur/analyseavance/analyseavance.component';
import { AdminaccueilComponent } from './admin/adminaccueil/adminaccueil.component';
import { UserComponent } from './admin/user/user.component';
import { LoguserComponent } from './admin/loguser/loguser.component';


const routes: Routes = [  
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {path:'accueil',component:AccueilComponent},
  {path:'connexion',component:LoginComponent},
  {path:'inscription',component:RegisterComponent},

  {path: 'admin', component:AdminhomeComponent,
    children :[
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      {path:'accueil',component:AdminaccueilComponent},
      {path:'user',component:UserComponent},
      {path:'activite',component:LoguserComponent},


    ],
    canActivate: [authGuard],
    data: { role: 'Admin' }
  },
  {path : 'chercheur', component:ChercheurhomeComponent,
    children :[
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      {path:'accueil',component:ChercheurComponent},
      {path:'analyse',component:AnalyseComponent,
        children:[
          { path: '', redirectTo: 'visualisation', pathMatch: 'full' },
          {path:'visualisation',component:VisualisationComponent},
          {path:'avance',component:AnalyseavanceComponent}

        ]
      },
      {path:'prevision',component:PrevisionComponent},
      {path:'sources',component:ComparesourcesComponent},
      {path:'rapport',component:RapportComponent},

    ],
    canActivate: [authGuard],
    data: { role: 'Chercheur' }
  },
  {path : 'etudiant', component: EtudianthomeComponent,
    children:[
      { path: '', redirectTo: 'visualisation', pathMatch: 'full' },
      {path:'visualisation',component:EtudiantvisualisationComponent},
      {path:'prevision',component:EtudiantprevisionComponent}

    ],
    canActivate: [authGuard],
    data: { role: 'Etudiant' }
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
