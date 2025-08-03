// weather-dashboard.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { interval, map, startWith } from 'rxjs';
import { ChercheurService } from 'src/app/services/chercheur.service';


interface QuickStat {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
  trend: number;
}

interface LiveDataItem {
  label: string;
  value: string;
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
}

interface DataPoint {
  date: string;
  fullDate: string;
  weatherAPI: number;
  openMeteo: number;
  visualCrossing: number;
}

@Component({
  selector: 'app-analyse',
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AnalyseComponent implements OnInit, OnDestroy{

  constructor(private chercheur_service:ChercheurService){}

  selectedPeriod = '7days';
  private intervalId1: any;

  selectedSource ='climate_data_weather'

  //Source value
  sourceValue = ''

  // Recherche
  searchText: string = 'Dakar';

  //Date et heure actuelle 
  dateHeureActuelle$:any
  intervalId :any
 

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
      label: 'Température Moyenne',
      value: '22.5',
      unit: '°C',
      color: '#ef4444',
      icon: 'bi-thermometer',
      trend: 2.5
    },
    {
      label: 'Humidité Actuelle',
      value: '68',
      unit: '%',
      color: '#3b82f6',
      icon: 'bi-droplet',
      trend: -1.2
    },
    {
      label: 'Pression Atmosphérique',
      value: '1013',
      unit: ' hPa',
      color: '#8b5cf6',
      icon: 'bi-speedometer2',
      trend: 0.8
    },
    {
      label: 'Vitesse du Vent',
      value: '15.2',
      unit: ' km/h',
      color: '#10b981',
      icon: 'bi-wind',
      trend: -3.1
    }
  ];

  // Live data for real-time monitoring
  liveData: LiveDataItem[] = [
    {
      label: 'Température',
      value: '23.1',
      unit: '°C',
      color: '#ef4444',
      icon: 'bi-thermometer',
      time: 'il y a 2 min'
    },
    {
      label: 'Humidité',
      value: '67',
      unit: '%',
      color: '#3b82f6',
      icon: 'bi-droplet',
      time: 'il y a 3 min'
    },
    {
      label: 'Pression',
      value: '1012',
      unit: ' hPa',
      color: '#8b5cf6',
      icon: 'bi-speedometer2',
      time: 'il y a 1 min'
    },
    {
      label: 'UV Index',
      value: '6',
      unit: '',
      color: '#f59e0b',
      icon: 'bi-sun',
      time: 'il y a 5 min'
    },
    {
      label: 'Vitesse du Vent',
      value: '15.2',
      unit: ' km/h',
      color: '#10b981',
      icon: 'bi-wind',
      time: 'il y a 4 min'
    }
  ];

  // Alerts and notifications
  alerts: Alert[] = [
    {
      title: 'Écart de température détecté',
      message: 'Différence de 3°C entre Weather API et Visual Crossing',
      icon: 'bi-thermometer',
      time: '10:30',
      type: 'warning'
    },
    {
      title: 'Données manquantes',
      message: 'Visual Crossing: 2h de données manquantes',
      icon: 'bi-exclamation-circle',
      time: '09:15',
      type: 'info'
    },
    {
      title: 'Forte variation d\'humidité',
      message: 'Chute de 20% en 1 heure',
      icon: 'bi-droplet',
      time: '08:45',
      type: 'warning'
    }
  ];

  // Sources comparison data
  sourcesComparison: SourceComparison[] = [
    {
      name: 'Weather API',
      color: '#3b82f6',
      icon: 'bi-cloud',
      avg: '22.8',
      min: '18.5',
      max: '27.1',
      reliability: 95
    },
    {
      name: 'Open Meteo',
      color: '#10b981',
      icon: 'bi-globe',
      avg: '22.3',
      min: '18.2',
      max: '26.8',
      reliability: 92
    },
    {
      name: 'Visual Crossing',
      color: '#f59e0b',
      icon: 'bi-graph-up',
      avg: '23.1',
      min: '19.0',
      max: '27.5',
      reliability: 88
    }
  ];

  // Paramètres climatiques
  parameters: ClimateParameter[] = [
    { value: 'temperature', label: 'Température', icon: 'bi-thermometer', unit: '°C', color: '#ef4444' },
    { value: 'humidity', label: 'Humidité', icon: 'bi-droplet', unit: '%', color: '#3b82f6' },
    { value: 'pressure', label: 'Pression', icon: 'bi-speedometer2', unit: 'hPa', color: '#8b5cf6' },
    { value: 'windSpeed', label: 'Vitesse du vent', icon: 'bi-wind', unit: 'km/h', color: '#10b981' },
    { value: 'uvIndex', label: 'Indice UV', icon: 'bi-sun', unit: '', color: '#f59e0b' }
  ];

  periods = [
    { value: '24h', label: '24 heures' },
    { value: '7days', label: '7 jours' },
    { value: '30days', label: '30 jours' },
  ];
   sources = [
    { value: 'climate_data_weather', label: 'Weather API' },
    { value: 'climate_data_openweather', label: 'Open Weather' },
    { value: 'climate_data_openmeteo', label: 'Open Meteo'},
  ];


  ngOnInit() {
    this.generateDataForAllParameters()
    this.createAllCharts()
    this.updateQuickStats()

    this.getlast24havg()
    this.getlast7daysavg()
    this.getlast30daysavg()
    this.getlasthourdata()
    this.getcurrentdata()

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
  ))
  }

  ngOnDestroy() {
    this.clearAllIntervals();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.destroyAllCharts();

  }



  private updateLiveData() {
    // Simulate real-time data updates
    this.liveData.forEach(item => {
      const baseValue = parseFloat(item.value);
      const variation = (Math.random() - 0.5) * 2; // ±1 unit variation
      item.value = (baseValue + variation).toFixed(1);
      item.time = 'il y a ' + Math.floor(Math.random() * 5 + 1) + ' min';
    });
  }

  private updateQuickStats() {
    // Update quick stats based on current data
    this.quickStats.forEach((stat, index) => {
      if (index < this.liveData.length) {
        const liveItem = this.liveData[index];
        stat.value = liveItem.value;
        stat.trend = (Math.random() - 0.5) * 6; // ±3% trend variation
      }
    });
  }

//Data for chart
params :any = ["temperature","pression","precipitation","humidite","vitesse_vent","nebulosite"]

//Dictionnairy for last 24h data
climatDict24h : { [key: string]: any } = {};
// Get last 24h data
getlast24havg(){
  for (let param  of this.params){
    this.chercheur_service.getlast24havg(this.selectedSource,this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.climatDict24h[param] = response.body.last24_avg
        }
      }
    })
  }
  console.log('last 24h',this.climatDict24h)

}

//Dictionnairy for last 24h data
climatDict7d : { [key: string]: any } = {};
//Get last 7 days data
getlast7daysavg(){
  for (let param  of this.params){
    this.chercheur_service.getlast7davg(this.selectedSource,this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.climatDict7d[param] = response.body.last7d_avg
        }
      }
    })
  }
  console.log('7 days',this.climatDict7d)

}

//Dictionnairy for last 30 days
climatDict30d : { [key: string]: any } = {};
//Get last 7 days data
getlast30daysavg(){
  for (let param  of this.params){
    this.chercheur_service.getlast30davg(this.selectedSource,this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.climatDict30d[param] = response.body.monthly_avg
        }
      }
    })
  }
  console.log('30 days',this.climatDict30d)

}

//Dictionnairy for last 30 days
latest_data : any = []
//Get last hour data
getlasthourdata(){
    this.chercheur_service.getlasthourdata(this.selectedSource,this.searchText).subscribe({
      next : (response)=>{ 
        if(response.body.message =="success"){    
        this.latest_data = response.body.latest_data[0]
        console.log('last hour ',this.latest_data)
          }
      }
    })
}

//Dictionnairy for last 30 days
current_data : any = []
//Get last hour data
getcurrentdata(){
    this.chercheur_service.getcurrentdata(this.selectedSource,this.searchText).subscribe({
      next : (response)=>{ 
        if(response.body.message =="success"){    
        this.current_data = response.body.current_data[0]
        console.log('current data ',this.current_data)
          }
      }
    })
}



  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    this.generateDataForAllParameters();
    this.updateAllParameterCharts();
  }
  //source choisit
  onSourceChange(source:string){
    this.selectedSource = source;
    console.log(this.selectedSource)
  }
  // Génération des données pour tous les paramètres
  generateDataForAllParameters() {
    this.parameters.forEach(param => {
      this.parametersData[param.value] = this.generateDataForParameter(param.value);
    });
  }

  // Génération des données pour un paramètre spécifique
  generateDataForParameter(parameter: string): DataPoint[] {
    const hours = this.selectedPeriod === '24h' ? 24 : 
                 this.selectedPeriod === '7days' ? 168 : 
                 this.selectedPeriod === '30days' ? 720 : 2160;
    
    const data: DataPoint[] = [];
    const dataPoints = Math.min(hours, this.selectedPeriod === '24h' ? 24 : 50);
    
    // Valeurs de base selon le paramètre
    let baseValue = 25;
    let variance = 5;
    
    switch (parameter) {
      case 'temperature':
        baseValue = 22;
        variance = 8;
        break;
      case 'humidity':
        baseValue = 65;
        variance = 15;
        break;
      case 'pressure':
        baseValue = 1013;
        variance = 20;
        break;
      case 'windSpeed':
        baseValue = 15;
        variance = 10;
        break;
      case 'uvIndex':
        baseValue = 5;
        variance = 3;
        break;
    }
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      if (this.selectedPeriod === '24h') {
        date.setHours(date.getHours() - (dataPoints - i - 1));
      } else {
        const hoursBack = Math.floor((dataPoints - i - 1) * (hours / dataPoints));
        date.setHours(date.getHours() - hoursBack);
      }
      
      const label = this.selectedPeriod === '24h' 
        ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
      
      // Génération de valeurs avec des variations réalistes entre sources
      const weatherAPI = +(baseValue + (Math.random() - 0.5) * variance).toFixed(1);
      const openMeteo = +(weatherAPI + (Math.random() - 0.5) * 2).toFixed(1); // Plus proche de weatherAPI
      const visualCrossing = +(baseValue + (Math.random() - 0.5) * variance * 1.2).toFixed(1); // Plus de variance
      
      data.push({
        date: label,
        fullDate: date.toISOString(),
        weatherAPI,
        openMeteo,
        visualCrossing
      });
    }
    
    return data;
  }

  // Création de tous les graphiques
  createAllCharts() {
    // Créer les graphiques pour chaque paramètre
    this.parameters.forEach(param => {
      this.createParameterChart(param);
    });
    
    // Créer les graphiques d'analyse
    this.createAccuracyChart();
    this.createDeviationChart();
  }

  // Création d'un graphique pour un paramètre spécifique
  createParameterChart(parameter: ClimateParameter) {
    const canvasId = 'chart-' + parameter.value;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    if (this.parameterCharts[parameter.value]) {
      this.parameterCharts[parameter.value]?.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.parametersData[parameter.value] || [];

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Weather API',
            data: data.map(d => d.weatherAPI),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'Visual Crossing',
            data: data.map(d => d.visualCrossing),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // On utilise la légende personnalisée dans le template
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#374151',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6b7280',
              maxTicksLimit: 8
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6b7280'
            },
            title: {
              display: true,
              text: parameter.unit,
              color: '#6b7280'
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

  // Met à jour tous les graphiques des paramètres
  updateAllParameterCharts() {
    this.parameters.forEach(param => {
      this.updateParameterChart(param);
    });
  }

  // Met à jour un graphique spécifique
  updateParameterChart(parameter: ClimateParameter) {
    const chart = this.parameterCharts[parameter.value];
    if (!chart) return;

    const data = this.parametersData[parameter.value] || [];
    
    // Update data
    chart.data.labels = data.map(d => d.date);
    chart.data.datasets[0].data = data.map(d => d.weatherAPI);
    chart.data.datasets[1].data = data.map(d => d.openMeteo);
    chart.data.datasets[2].data = data.map(d => d.visualCrossing);
    
    chart.update('none');
  }

  createAccuracyChart() {
    const canvas = document.getElementById('accuracyChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Weather API', 'Open Meteo', 'Visual Crossing'],
        datasets: [{
          data: [95, 92, 88],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    };

    this.accuracyChart = new Chart(ctx, config);
  }

  createDeviationChart() {
    const canvas = document.getElementById('deviationChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.deviationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.parameters.slice(0, 4).map(p => p.label),
        datasets: [{
          label: 'Écart moyen (%)',
          data: [2.1, 1.8, 3.2, 2.5],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderRadius: 4,
          borderWidth: 0
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
            callbacks: {
              label: function(context) {
                return 'Écart: ' + context.parsed.y + '%';
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
              color: '#6b7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#6b7280',
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  // Détruit tous les graphiques
  destroyAllCharts() {
    // Détruire les graphiques des paramètres
    Object.values(this.parameterCharts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.parameterCharts = {};
    
    // Détruire les graphiques d'analyse
    if (this.accuracyChart) this.accuracyChart.destroy();
    if (this.deviationChart) this.deviationChart.destroy();
  }

  // Obtient les statistiques pour un paramètre donné
  getParameterStats(parameterValue: string): { avg: string, min: string, max: string } {
    const data = this.parametersData[parameterValue];
    if (!data || data.length === 0) {
      return { avg: '0', min: '0', max: '0' };
    }

    // Calculer les statistiques en combinant toutes les sources
    const allValues = data.flatMap(d => [d.weatherAPI, d.openMeteo, d.visualCrossing]);
    const avg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    return {
      avg: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1)
    };
  }

  // Fonction de tracking pour ngFor (optimisation des performances)
  trackByParameter(index: number, parameter: ClimateParameter): string {
    return parameter.value;
  }
   // Configuration des intervalles
  /*private setupIntervals(): void {
  
    // Mise à jour de l'heure toutes les secondes
    this.intervalId1 = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }
   // Méthodes utilitaires pour le template
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit',second: '2-digit' });
  }
  /* Initialisation de la date et heure
  private initializeDateTime(): void {
    this.updateDateTime();
  }
 
  // Mise à jour de la date et heure
  /*private updateDateTime(): void {
    this.today = new Date();
    this.moisEtAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this.today);
    this.moisEtAnnee = this.moisEtAnnee.charAt(0).toUpperCase() + this.moisEtAnnee.slice(1);
    const heures = this.today.getHours().toString().padStart(2, '0');
    const minutes = this.today.getMinutes().toString().padStart(2, '0');
    this.heureActuelle = `${heures}:${minutes}`;
  }*/

private clearAllIntervals(): void {
    if (this.intervalId1) {
      clearInterval(this.intervalId1);
    }
    if(this.intervalId){
      clearInterval(this.intervalId);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  getTotalDataPoints(): number {
    const parameterData = Object.values(this.parametersData)[0];
    return parameterData ? parameterData.length * 3 : 0; // 3 sources par paramètre
  }

  getLastSyncTime(): string {
    const now = new Date();
    const minutes = Math.floor(Math.random() * 10) + 1;
    const lastSync = new Date(now.getTime() - minutes * 60000);
    return lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

}