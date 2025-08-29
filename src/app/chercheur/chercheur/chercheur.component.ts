import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

interface SourceData {
  name: string;
  color: string;
  icon: string;
  data: any; // Changé de [] à any pour plus de flexibilité
  status: 'active' | 'inactive' | 'error';
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  nebulosite?: number;
}

interface Parameter {
  key: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'status' | 'data'>;
  label: string;
  unit: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-chercheur',
  templateUrl: './chercheur.component.html',
  styleUrls: ['./chercheur.component.css']
})
export class ChercheurComponent implements OnInit, OnDestroy {
  // Intervalles
  private intervalId: any;
  private intervalId1: any;
  private refreshInterval: any;
  private routerSubscription: Subscription = new Subscription();

  
  
  // État de l'interface
  dropdownOpen = false;
  isSidebarCollapsed = false;
  loading = false;

  // Données météorologiques
  weather_data: any = {};
  condition: string = '';
  open_data: any = {};
  openweather_data: any = {};
  condition_openweather : string = '';

  // Date et heure
  moisEtAnnee: string = '';
  heureActuelle: string = '';
  today: Date = new Date();

  // Recherche
  searchText: string = 'Thiès';

  //last update
  lastUpdate: Date | null = null;

  // Paramètre sélectionné
  selectedParameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'status' | 'data'> = 'temperature';

  constructor(
    private router: Router, 
    private user_service: UserService, 
    private chercheur_service: ChercheurService
  ) {
    this.initializeRouterSubscription();
  }

  ngOnInit(): void {
    this.initializeDateTime();
    this.getMeteo();
    this.setupIntervals();
    this.lastUpdate = new Date(); 
    console.log("Contenu chargé");
  }

  ngOnDestroy(): void {
    this.clearAllIntervals();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Initialisation des abonnements router
  private initializeRouterSubscription(): void {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        setTimeout(() => this.loading = false, 500);
      }
    });
  }

  // Configuration des intervalles
  private setupIntervals(): void {
    // Mise à jour météo toutes les 10 minutes
    this.intervalId = setInterval(() => {
      this.getMeteo();
      this.lastUpdate = new Date();
    }, 600000);

    // Mise à jour de l'heure toutes les secondes
    this.intervalId1 = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  // Initialisation de la date et heure
  private initializeDateTime(): void {
    this.updateDateTime();
  }





  // Mise à jour de la date et heure
  private updateDateTime(): void {
    this.today = new Date();
    this.moisEtAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this.today);
    this.moisEtAnnee = this.moisEtAnnee.charAt(0).toUpperCase() + this.moisEtAnnee.slice(1);
    const heures = this.today.getHours().toString().padStart(2, '0');
    const minutes = this.today.getMinutes().toString().padStart(2, '0');
    this.heureActuelle = `${heures}:${minutes}`;
  }

  // Nettoyage des intervalles
  private clearAllIntervals(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.intervalId1) {
      clearInterval(this.intervalId1);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Toggle pour la sidebar et dropdown
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Traduction des conditions météo
  conditionTraduite(condition: string): string {
    const translations: { [key: string]: string } = {
      "Sunny": "Ensoleillé",
      "Partly Cloudy": "Partiellement nuageux",
      "Partially cloudy": "Partiellement nuageux",
      "Cloudy": "Nuageux",
      "Cloudy ": "Nuageux",
      "Overcast": "Couvert",
      "Patchy rain nearby": "Pluie éparse à proximité",
      "Moderate rain": "Pluie modérée",
      "Light rain shower": "Averses de pluie légère",
      "Thundery outbreaks possible": "Risque d'orages",
      "Clear": "Ciel dégagé",
      "Heavy rain": "Forte pluie",
      "Rain, Partially cloudy": "Pluie, Partiellement nuageux",
      "Rain, Overcast": "Pluie, couvert"
    };
    
    return translations[condition] || condition;
  }

  // Récupération de toutes les données météo
  getMeteo(): void {
    this.getmeteoWeather();
    this.getMeteoOpen();
    this.getMeteoOpenWeather();
    this.lastUpdate = new Date(); 

  }
  
// Corrigez la méthode getLastUpdateMinutes :
getLastUpdateMinutes(): number {
  if (!this.lastUpdate) return 0;
  
  const now = new Date();
  const diffMs = now.getTime() - this.lastUpdate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  return diffMinutes;
}

// Corrigez la méthode getLastUpdateString :
getLastUpdateString(): string {
  if (!this.lastUpdate) return 'Jamais mis à jour';
  
  const minutes = this.getLastUpdateMinutes();
  
  if (minutes === 0) return 'À l\'instant';
  if (minutes === 1) return 'Il y a 1 minute';
  
  return `Il y a ${minutes} minutes`;
}


  // Données Weather API
  getmeteoWeather(): void {
    this.loading = true;
    this.chercheur_service.getMeteovilleWeather(this.searchText).subscribe({
      next: (response) => {
        if (response.body?.message && response.body.data_weather[0]!=null) {
          this.weather_data = response.body.data_weather[0];
          console.log('Weather API data:', this.weather_data);
          this.condition = this.conditionTraduite(this.weather_data.condition);
          this.updateSourceData('Weather API', this.weather_data);
        }else {
           this.updateSourceStatus('Weather API', 'inactive');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur Weather API:', error);
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
        this.updateSourceStatus('Weather API', 'error');
        this.loading = false;
      }
    });
  }

  // Données Open Meteo
  getMeteoOpen(): void {
    this.loading = true;
    this.chercheur_service.getMeteovilleOpen(this.searchText).subscribe({
      next: (response) => {
        if (response.body.message &&  response.body.data_open[0]!= null) {
          this.open_data = response.body.data_open[0];
          console.log('Open Meteo data:', this.open_data);
          this.updateSourceData('Open Meteo', this.open_data);
        }else {
           this.updateSourceStatus('Open Meteo', 'inactive');
        }
        this.loading = false;
      },
      error: (error) => {
        if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
        console.error('Erreur Open Meteo:', error);
        this.updateSourceStatus('Open Meteo', 'error');
        this.loading = false;
      }
    });
  }
capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
  // Données Open Weather
  getMeteoOpenWeather(): void {
    this.loading = true;
    this.chercheur_service.getMeteovilleOpenWeather(this.searchText).subscribe({
      next: (response) => {
        if (response.body.message && response.body.data_openweather[0] !=null) {
          this.openweather_data = response.body.data_openweather[0];
          console.log('Open Weather data:', this.openweather_data);
          this.condition_openweather = this.capitalize(this.openweather_data.condition)
          this.updateSourceData('Open Weather', this.openweather_data);
        }
        else {
           this.updateSourceStatus('Open Weather', 'inactive');
        }
        this.loading = false;
      },
      error: (error) => {
        if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
        console.error('Erreur Open Weather :', error);
        this.updateSourceStatus('Open Weather', 'error');
        this.loading = false;
      }
    });
  }

  // Mise à jour des données de source
  private updateSourceData(sourceName: string, data: any): void {
    const source = this.sources.find(s => s.name === sourceName);
    if (source) {
      source.data = data;
      source.status = 'active';
      // Mapper les données selon la structure attendue
      source.temperature = data.temperature;
      source.humidity = data.humidite;
      source.pressure = data.pression;
      source.windSpeed = data.vitesse_vent;
      source.nebulosite = data.nebulosite;
    }
  }

  // Mise à jour du statut de source
  private updateSourceStatus(sourceName: string, status: 'active' | 'inactive' | 'error'): void {
    const source = this.sources.find(s => s.name === sourceName);
    if (source) {
      source.status = status;
    }
  }

  // Configuration des sources
  sources: SourceData[] = [
    {
      name: 'Weather API',
      color: '#3b82f6',
      icon: 'bi-cloud',
      data: {},
      status: 'inactive'
    },
    {
      name: 'Open Meteo',
      color: '#058c5fff',
      icon: 'bi-globe',
      data: {},
      status: 'inactive'
    },
    {
      name: 'Open Weather',
      color: '#f59e0b',
      icon: 'bi-graph-up',
      data: {},
      status: 'inactive'
    }
  ];

  // Paramètres disponibles
  parameters: Parameter[] = [
    { 
      key: 'temperature', 
      label: 'Température', 
      unit: '°C', 
      icon: 'bi-thermometer', 
      color: '#ef4444' 
    },
    { 
      key: 'humidity', 
      label: 'Humidité', 
      unit: '%', 
      icon: 'bi-droplet', 
      color: '#3b82f6' 
    },
    { 
      key: 'pressure', 
      label: 'Pression', 
      unit: 'hPa', 
      icon: 'bi-speedometer2', 
      color: '#8b5cf6' 
    },
    { 
      key: 'windSpeed', 
      label: 'Vitesse du vent', 
      unit: 'km/h', 
      icon: 'bi-wind', 
      color: '#10b981' 
    },
    { 
      key: 'nebulosite', 
      label: 'Nébulosité', 
      unit: '', 
      icon: 'bi-sun', 
      color: '#f59e0b' 
    }
  ];

  // Changement de paramètre
  onParameterChange(parameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'status' | 'data'>): void {
    this.selectedParameter = parameter;
  }

  // Obtenir le paramètre actuel
  getCurrentParameter(): Parameter {
    return this.parameters.find(p => p.key === this.selectedParameter) || this.parameters[0];
  }

  // Obtenir la valeur d'un paramètre pour une source
  getParameterValue(source: SourceData, parameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'status' | 'data'>): number {
    return source[parameter] || 0;
  }

  // Classes CSS pour le statut
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'text-success',
      'inactive': 'text-warning',
      'error': 'text-danger'
    };
    return statusClasses[status] || 'text-muted';
  }

  // Icônes pour le statut
  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'active': 'bi-check-circle-fill',
      'inactive': 'bi-pause-circle-fill',
      'error': 'bi-x-circle-fill'
    };
    return statusIcons[status] || 'bi-question-circle-fill';
  }

  // Statistiques comparatives
  getMinValue(): number {
    const values = this.sources
      .filter(s => s.status === 'active')
      .map(s => this.getParameterValue(s, this.selectedParameter))
      .filter(v => v !== undefined && v !== null);
    return values.length > 0 ? Math.min(...values) : 0;
  }

  getMaxValue(): number {
    const values = this.sources
      .filter(s => s.status === 'active')
      .map(s => this.getParameterValue(s, this.selectedParameter))
      .filter(v => v !== undefined && v !== null);
    return values.length > 0 ? Math.max(...values) : 0;
  }

  getAverageValue(): number {
    const values = this.sources
      .filter(s => s.status === 'active')
      .map(s => this.getParameterValue(s, this.selectedParameter))
      .filter(v => v !== undefined && v !== null);
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10;
  }

  getDifference(): number {
    return Math.round((this.getMaxValue() - this.getMinValue()) * 10) / 10;
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('fr-FR');
  }

  // Déconnexion
  logOut(): void {
    this.user_service.logout();
    this.router.navigate(["/connexion"]);
    console.log('Redirection vers connexion');
  }

  // Affichage d'alertes
  showAlertMessage(title: string, message: string, icon: any): Promise<any> {
    return Swal.fire({
      title: title,
      text: message,
      icon: icon,
      showCloseButton: true,
      confirmButtonColor: '#3085d6',
    });
  }
}