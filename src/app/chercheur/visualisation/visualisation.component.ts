// weather-dashboard.component.ts
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { interval, map, startWith, forkJoin, finalize } from 'rxjs';
import { ChercheurService } from 'src/app/services/chercheur.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

interface QuickStat {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
  trend: any;
}

interface LiveDataItem {
  label: string;
  value: any;
  unit: string;
  color: string;
  icon: string;
  time: string;
}

interface Alert {
  title: string;
  message: string;
  icon: string;
  time: string;
  type: 'warning' | 'info' | 'danger';
}

interface SourceComparison {
  name: string;
  color: string;
  icon: string;
  avg: string;
  min: string;
  max: string;
  reliability: number;
}

interface ClimateParameter {
  value: string;
  label: string;
  icon: string;
  unit: string;
  color: string;
  back:string;
}

interface DataPoint {
  date: string;
  fullDate: string;
  weatherAPI: number;
  openMeteo: number;
  visualCrossing: number;
}

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualisationComponent implements OnInit, OnDestroy {
  routerSubscription: any;

  constructor(
    private router :Router,
    private chercheur_service: ChercheurService,
    private user_service : UserService,
    private cdr: ChangeDetectorRef  // Ajout pour OnPush
  ) {}

  selectedPeriod = '24h';
  private intervalId1: any;
  private intervalId2: any;
  loading = true;  // Initial loading state
  selectedSource: string = 'climate_data_weather';
  source = "Weather API";

  user_id : any =  sessionStorage.getItem('id')
  action = ''
  statut : boolean = false
  
  //Graph type
  graph:any  ='bar'

  // Source value
  sourceValue = '';

  // Recherche
  searchText: string = 'Thiès';

  // Date et heure actuelle 
  dateHeureActuelle$: any;
  intervalId: any;

  // Date et heure
  moisEtAnnee: string = '';
  heureActuelle: string = '';
  today: Date = new Date();

  // Données pour chaque paramètre climatique
  parametersData: { [key: string]: DataPoint[] } = {};
  
  // Charts pour chaque paramètre
  parameterCharts: { [key: string]: Chart | null } = {};
  
  // Charts d'analyse
  accuracyChart: Chart<'doughnut', number[], unknown> | null = null;
  deviationChart: Chart | null = null;
  
  private refreshInterval: any;

  // Quick stats for dashboard overview
  quickStats: QuickStat[] = [
    {
      label: 'Température Actuelle',
      value: '--',
      unit: '°C',
      color: '#ef4444',
      icon: 'bi-thermometer',
      trend: 0
    },
    {
      label: 'Humidité Actuelle ',
      value: '--',
      unit: '%',
      color: '#3b82f6',
      icon: 'bi-droplet',
      trend: 0
    },
    {
      label: 'Pression Atmos. Actuelle',
      value: '--',
      unit: ' hPa',
      color: '#8b5cf6',
      icon: 'bi-speedometer2',
      trend: 0
    },
    {
      label: 'Vitesse du Vent Actuelle',
      value: '--',
      unit: ' km/h',
      color: '#10b981',
      icon: 'bi-wind',
      trend: 0
    }
  ];

  // Paramètres climatiques
  parameters: ClimateParameter[] = [
    { value: 'temperature', label: 'Température', icon: 'bi-thermometer', unit: '°C', color: '#ef4444',back:'#fcdfdfff' },
    { value: 'humidite', label: 'Humidité', icon: 'bi-droplet', unit: '%', color: '#043d99ff',back:'#e3ebf9ff' },
    { value: 'precipitation', label: 'Précipitation', icon: 'bi-cloud-drizzle', unit: 'mm', color: '#2356e3ff', back:'#e7ebf7ff' },
    { value: 'pression', label: 'Pression', icon: 'bi-speedometer2', unit: 'hPa', color: '#250472ff', back:'#e2daf7ff' },
    { value: 'vitesse_vent', label: 'Vitesse du vent', icon: 'bi-wind', unit: 'km/h', color: '#10b981',back:'#e4f1edff' },
    { value: 'nebulosite', label: 'Nébulosité', icon: 'bi-cloud-fog2', unit: '', color: '#1a0797ff', back:'#e7e5f7ff' }
  ];

  periods = [
    { value: '24h', label: '24 heures' },
    { value: '7days', label: '7 jours' },
    { value: '30days', label: '30 jours' },
  ];

  diagrams =[
    {value:'line', label:'Line'},
    {value:'bar', label:'Bar'}
  ]

  sources = [
    { value: 'climate_data_weather', label: 'Weather API' },
    { value: 'climate_data_openweather', label: 'Open Weather' },
    { value: 'climate_data_openmeteo', label: 'Open Meteo'},
  ];

  // Data for chart
  params: any = ["temperature", "pression", "precipitation", "humidite", "vitesse_vent", "nebulosite"];

  // Dictionary for last 24h data
  climatDict24h: { [key: string]: any } = {};
  
  // Dictionary for last 7 days data
  climatDict7d: { [key: string]: any } = {};
  
  // Dictionary for last 30 days
  climatDict30d: { [key: string]: any } = {};
  
  // Table for last hour data
  latest_data: any = [];
  
  // Table for current data 
  current_data: any = [];

  ngOnInit() {
    this.initializeComponent();
    this.setupDateTimeObservable();
    this.setupIntervals();
  }

 /* ngOnDestroy() {
    this.clearAllIntervals();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }*/

  private async initializeComponent(): Promise<void> {
    try {
      this.loading = true;
      this.cdr.detectChanges(); // Force update for OnPush

      // Charger les données initiales en parallèle
      await Promise.all([
        this.getlasthourdata(this.selectedSource, this.searchText),
        this.getcurrentdata()
      ]);

      // Charger les données pour les graphiques
      await this.getdataforgraph(this.selectedSource, this.searchText, this.selectedPeriod);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      // S'assurer que le loading se termine après un délai minimum
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges(); // Force update for OnPush
      }, 1000);
    }
  }

  private setupDateTimeObservable(): void {
    this.dateHeureActuelle$ = interval(1000).pipe(
      startWith(0),
      map(() =>
        new Date().toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      )
    );
  }

  // Get last 24h data with Promise
  private getlast24havg(source: string, ville: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let completedRequests = 0;
      const totalRequests = this.params.length;

      if (totalRequests === 0) {
        resolve();
        return;
      }

      for (let param of this.params) {
        this.chercheur_service.getlast24havg(source, ville, param).subscribe({
          next: (response) => {
            if (response.body.message === "success") {
              this.climatDict24h[param] = response.body.last24_avg;
            }
            completedRequests++;
            if (completedRequests === totalRequests) {
              console.log('last 24h', this.climatDict24h);
              resolve();
            }
          },
          error: (error) => {
             if (error.error.message == "Token expiré"){
              this.user_service.logout()
              this.router.navigate(["/connexion"])
            }
            console.error(`Erreur pour ${param}:`, error);
            completedRequests++;
            if (completedRequests === totalRequests) {
              resolve(); // Continue même avec des erreurs
            }
          }
        });
      }
    });
  }

  // Get last 7 days data with Promise
  private getlast7daysavg(source: string, ville: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let completedRequests = 0;
      const totalRequests = this.params.length;

      if (totalRequests === 0) {
        resolve();
        return;
      }

      for (let param of this.params) {
        this.chercheur_service.getlast7davg(source, ville, param).subscribe({
          next: (response) => {
            if (response.body.message === "success") {
              this.climatDict7d[param] = response.body.last7d_avg;
            }
            completedRequests++;
            if (completedRequests === totalRequests) {
              console.log('7 days', this.climatDict7d);
              resolve();
            }
          },
          error: (error) => {
             if (error.error.message == "Token expiré"){
              this.user_service.logout()
              this.router.navigate(["/connexion"])
            }
            console.error(`Erreur pour ${param}:`, error);
            completedRequests++;
            if (completedRequests === totalRequests) {
              resolve();
            }
          }
        });
      }
    });
  }

  // Get last 30 days data with Promise
  private getlast30daysavg(source: string, ville: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let completedRequests = 0;
      const totalRequests = this.params.length;

      if (totalRequests === 0) {
        resolve();
        return;
      }

      for (let param of this.params) {
        this.chercheur_service.getlast30davg(source, ville, param).subscribe({
          next: (response) => {
            if (response.body.message === "success") {
              this.climatDict30d[param] = response.body.monthly_avg;
            }
            completedRequests++;
            if (completedRequests === totalRequests) {
              console.log('30 days', this.climatDict30d);
              resolve();
            }
          },
          error: (error) => {
             if (error.error.message == "Token expiré"){
              this.user_service.logout()
              this.router.navigate(["/connexion"])
            }
            console.error(`Erreur pour ${param}:`, error);
            completedRequests++;
            if (completedRequests === totalRequests) {
              resolve();
            }
          }
        });
      }
    });
  }

  // Get last hour data with Promise
  private getlasthourdata(source: string, ville: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.chercheur_service.getlasthourdata(source, ville).subscribe({
        next: (response) => {
          if (response.body.message === "success") {
            this.latest_data = response.body.latest_data[0];
            console.log('last hour ', this.latest_data);
          }
          resolve();
          this.loading = false

        },
        error: (error) => {
           if (error.error.message == "Token expiré"){
            this.user_service.logout()
            this.router.navigate(["/connexion"])
          }
          console.error('Erreur getlasthourdata:', error);
          resolve(); // Continue même avec erreur
        }
      });
    });
  }

  // Get current data with Promise
  private getcurrentdata(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.chercheur_service.getcurrentdata(this.selectedSource, this.searchText).subscribe({
        next: (response) => {
          if (response.body.message === "success") {
            this.current_data = response.body.current_data[0];
            console.log('current data ', this.current_data);
            
            // Mise à jour des quick stats
            this.updateQuickStats();
            this.loading = false

          }
          resolve();
        }, error: (error) => {
           if (error.error.message == "Token expiré"){
            this.user_service.logout()
            this.router.navigate(["/connexion"])
          }
          console.error('Erreur getcurrentdata:', error);
          resolve(); // Continue même avec erreur
        }
      });
    });
  }

  private updateQuickStats(): void {
    if (this.current_data && this.latest_data) {
      this.quickStats[0].value = this.current_data['temperature'] 
      this.quickStats[1].value = this.current_data['humidite'] 
      this.quickStats[2].value = this.current_data['pression'] 
      this.quickStats[3].value = this.current_data['vitesse_vent'] 

      this.quickStats[0].trend = this.current_data['temperature'] - this.latest_data['temperature'] || 0 
      this.quickStats[1].trend = this.current_data['humidite'] - this.latest_data['humidite'] || 0
      this.quickStats[2].trend = this.current_data['pression'] - this.latest_data['pression'] || 0
      this.quickStats[3].trend = this.current_data['vitesse_vent'] - this.latest_data['vitesse_vent'] || 0
      
      this.cdr.detectChanges(); // Force update for OnPush
    }
  }

  // Get all currents parameters every 10 mins
  private setupIntervals(): void {
    this.intervalId2 = setInterval(() => {
      this.getcurrentdata();
      this.getlasthourdata(this.selectedSource, this.searchText);
    }, 600000);
  }

  // Ajoutez ces méthodes à votre component.ts

// Méthode pour créer un graphique pour un paramètre spécifique
private createParameterChart(parameter: ClimateParameter): void {
  const canvasId = parameter.value;
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
  if (!canvas) {
    console.error(`Canvas with id ${canvasId} not found`);
    return;
  }

  // Détruire le graphique existant s'il existe
  if (this.parameterCharts[parameter.value]) {
    this.parameterCharts[parameter.value]?.destroy();
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Obtenir les données selon la période sélectionnée
  const data = this.getDataForParameter(parameter.value);
  
  const chartConfig: ChartConfiguration = {
    type:this.graph,
    data: {
      labels: data.labels,
      datasets: [{
        label: parameter.label,
        data: data.values,
        borderColor: parameter.color,
        backgroundColor: parameter.back,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: parameter.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: parameter.color,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => {
              return `${parameter.label}: ${context.parsed.y}${parameter.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 11
            },
            callback: function(value) {
              return value + parameter.unit;
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  };

  this.parameterCharts[parameter.value] = new Chart(ctx, chartConfig);
}

// Méthode pour obtenir les données d'un paramètre selon la période
private getDataForParameter(parameterValue: string): { labels: string[], values: number[] } {
  let data: any;
  let labels: string[] = [];
  let values: number[] = [];

  switch (this.selectedPeriod) {
    case '24h':
       data = this.climatDict24h[parameterValue];
      if (data && Array.isArray(data)) {
        labels = data.map((item: any) => {
          return item.date + 'h';
        });
        values = data.map((item: any) => parseFloat(item.valeur) || 0);
      }
      break;
      
    case '7days':
      data = this.climatDict7d[parameterValue];
      if (data && Array.isArray(data)) {
        labels = data.map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        values = data.map((item: any) => parseFloat(item.moyenne) || 0);
      }
      break;
      
    case '30days':
      data = this.climatDict30d[parameterValue];
      if (data && Array.isArray(data)) {
        labels = data.map((item: any) => {
          const date = new Date(item.date);
          return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        values = data.map((item: any) => parseFloat(item.moyenne) || 0);
      }
      break;
      
    default:
      // Si pas de données, créer des données par défaut
      labels = ['Pas de données'];
      values = [0];
  }

  // Si pas de données valides, retourner des données par défaut
  if (labels.length === 0 || values.length === 0) {
    labels = ['Pas de données'];
    values = [0];
  }

  return { labels, values };
}

// Méthode pour créer tous les graphiques
private createAllParameterCharts(): void {
  // Attendre que le DOM soit mis à jour
  setTimeout(() => {
    this.parameters.forEach(parameter => {
      this.createParameterChart(parameter);
    });
  }, 100);
}

// Méthode pour détruire tous les graphiques
private destroyAllCharts(): void {
  Object.keys(this.parameterCharts).forEach(key => {
    if (this.parameterCharts[key]) {
      this.parameterCharts[key]?.destroy();
      this.parameterCharts[key] = null;
    }
  });
}

// Modifiez votre méthode getdataforgraph existante pour inclure la création des graphiques
async getdataforgraph(source: string, ville: string, periode: string): Promise<void> {
  try {
    this.loading = true;
    this.cdr.detectChanges();
    
    console.log('Période:', periode);
    console.log('Source:', source);

    // Détruire les graphiques existants
    this.destroyAllCharts();

    // Charger les données de base
    await Promise.all([
      this.getlasthourdata(source, ville),
      this.getcurrentdata()
    ]);

    // Charger les données selon la période
    if (periode === '24h') {
      await this.getlast24havg(source, ville);
    } else if (periode === '7days') {
      await this.getlast7daysavg(source, ville);
    } else {
      await this.getlast30daysavg(source, ville);
    }

    // Créer les graphiques après le chargement des données
    this.createAllParameterCharts();

  } catch (error) {
    console.error('Erreur lors du chargement des données graphique:', error);
  } finally {
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 800);
  }
}

// Modifiez aussi votre ngOnDestroy pour inclure la destruction des graphiques
ngOnDestroy() {
  this.clearAllIntervals();
  this.destroyAllCharts();
  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
  }
}




  // Get all data for graph with proper loading management
 /* async getdataforgraph(source: string, ville: string, periode: string): Promise<void> {
    try {
      this.loading = true;
      this.cdr.detectChanges(); // Force update for OnPush
      
      console.log('Période:', periode);
      console.log('Source:', source);

      // Charger les données de base
      await Promise.all([
        this.getlasthourdata(source, ville),
        this.getcurrentdata()
      ]);

      // Charger les données selon la période
      if (periode === '24h') {
        await this.getlast24havg(source, ville);
      } else if (periode === '7days') {
        await this.getlast7daysavg(source, ville);
      } else {
        await this.getlast30daysavg(source, ville);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données graphique:', error);
    } finally {
      // Délai minimum pour éviter le scintillement
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges(); // Force update for OnPush
      }, 800);
    }
  }*/

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    // Recharger les données pour la nouvelle période
    this.getdataforgraph(this.selectedSource, this.searchText, this.selectedPeriod);
  }
  onGraphChange(type:string){
    this.graph = type
    this.getdataforgraph(this.selectedSource, this.searchText, this.selectedPeriod);

  }

  // Source choisie
  onSourceChange(source: string): void {
    this.selectedSource = source;
    
    if (this.selectedSource === 'climate_data_openmeteo') {
      this.source = "Open Meteo";
    } else if (this.selectedSource === 'climate_data_openweather') {
      this.source = "Open Weather";
    } else {
      this.source = "Weather API";
    }
    
    // Recharger les données pour la nouvelle source
    this.getdataforgraph(this.selectedSource, this.searchText, this.selectedPeriod);
    }

//Download Image
  downloadCardAsImage(className: string, fileName: string = 'resultat_image.png'): void {
    const card: HTMLElement | null = document.querySelector(`.${className}`);
    if (!card) {
      console.error("Aucun élément avec la classe spécifiée n'a été trouvé.");
      return;
    }

    const script: HTMLScriptElement = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = (): void => {
      (window as any).html2canvas(card).then((canvas: HTMLCanvasElement) => {
        const image: string = canvas.toDataURL('image/png');
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = image;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification("Image téléchargée avec succès", 'success');
        this.action ='L\'utilisateur à télécharger une visualistation'
        this.statut = true
        this.save_do_something(this.user_id,this.action,this.statut)
      }).catch((error: Error) => {
        console.error('Erreur lors de la création de l\'image:', error);
      });
    };
    script.onerror = (): void => {
      console.error('Erreur lors du chargement de html2canvas.');
       this.action ='L\'utilisateur tente télécharger une visualisation'
        this.statut = false
        this.save_do_something(this.user_id,this.action,this.statut)
    };
    document.head.appendChild(script);
  }

  save_do_something(id: number, action: string, statut: boolean) {
   console.log('Calling save_do_something with:', { id, action, statut });
   if (!id) {
      console.error('User ID is not available');
      this.showNotification('ID utilisateur non disponible', 'error');
      return;
   }
   this.user_service.do_something(id, action, statut).subscribe({
      next: (response) => {
         console.log('Activity saved successfully:', response.body);
      },
      error: (error: HttpErrorResponse) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
         console.error('Error saving activity:', error);
      }
   });
}

showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    Swal.fire({
      toast: true,
      icon: type,
      title: message,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true
    });
    this.cdr.detectChanges();
  }


//Pour aller dans avancé
analyseavance(){
  this.router.navigate(["/chercheur/analyse/avance"])
}


  // Fonction de tracking pour ngFor (optimisation des performances)
  trackByParameter(index: number, parameter: ClimateParameter): string {
    return parameter.value;
  }

  private clearAllIntervals(): void {
    if (this.intervalId1) {
      clearInterval(this.intervalId1);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.intervalId2) {
      clearInterval(this.intervalId2);
    }
  }
}