import { NgModule, LOCALE_ID  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HeaderComponent } from './static/header/header.component';
import { FooterComponent } from './static/footer/footer.component';
import { AccueilComponent } from './accueil/accueil.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminhomeComponent } from './admin/adminhome/adminhome.component';
import { ChercheurhomeComponent } from './chercheur/chercheurhome/chercheurhome.component';
import { EtudianthomeComponent } from './etudiant/etudianthome/etudianthome.component';
import { NgChartsModule } from 'ng2-charts';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ChercheurComponent } from './chercheur/chercheur/chercheur.component';
import { ChercheurheaderComponent } from './chercheur/chercheurheader/chercheurheader.component';
import { ComparesourcesComponent } from './chercheur/comparesources/comparesources.component';
import { AdminComponent } from './admin/admin/admin.component';
import { AnalyseComponent } from './chercheur/analyse/analyse.component';
import { RapportComponent } from './chercheur/rapport/rapport.component';
import { VisualisationComponent } from './chercheur/visualisation/visualisation.component';
import { EtudiantheaderComponent } from './etudiant/etudiantheader/etudiantheader.component';
import { EtudiantvisualisationComponent } from './etudiant/etudiantvisualisation/etudiantvisualisation.component';
import { EtudiantprevisionComponent } from './etudiant/etudiantprevision/etudiantprevision.component';
import { PrevisionComponent } from './chercheur/prevision/prevision.component';
import { AdminheaderComponent } from './admin/adminheader/adminheader.component';
import { AnalyseavanceComponent } from './chercheur/analyseavance/analyseavance.component';
import { AdminaccueilComponent } from './admin/adminaccueil/adminaccueil.component';
import { UserComponent } from './admin/user/user.component';
import { LoguserComponent } from './admin/loguser/loguser.component';
//import { DataTablesModule } from 'angular-datatables';


registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    AccueilComponent,
    AdminhomeComponent,
    ChercheurhomeComponent,
    EtudianthomeComponent,
    ChercheurComponent,
    ChercheurheaderComponent,
    ComparesourcesComponent,
    AdminComponent,
    AnalyseComponent,
    RapportComponent,
    VisualisationComponent,
    EtudiantheaderComponent,
    EtudiantvisualisationComponent,
    EtudiantprevisionComponent,
    PrevisionComponent,
    AdminheaderComponent,
    AnalyseavanceComponent,
    AdminaccueilComponent,
    UserComponent,
    LoguserComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    NgChartsModule,
    CommonModule,
    //DataTablesModule
  ],
  providers: [
      { provide: LOCALE_ID, useValue: 'fr-FR' } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
