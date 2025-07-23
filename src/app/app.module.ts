import { NgModule, LOCALE_ID  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [
      { provide: LOCALE_ID, useValue: 'fr-FR' } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
