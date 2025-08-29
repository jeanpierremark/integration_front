// weather-comparison.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { interval, map, startWith, forkJoin } from 'rxjs';
import { ChercheurService } from 'src/app/services/chercheur.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-comparesources',
  templateUrl: './comparesources.component.html',
  styleUrls: ['./comparesources.component.css']
})
export class ComparesourcesComponent implements OnInit {
  selectedParameter = 'temperature';
  selectedPeriod = '7days';
  chartType = 'line';
  constructor(private chercheur_service : ChercheurService, private user_service : UserService, private router:Router){}
  
  // Recherche
  searchText: string = 'Thiès';

  //Current date et time
  dateHeureActuelle$ : any
  
  data: any[] = [];
  chart: Chart | null = null;
  isLoading = false;

  parameters = [
    { value: 'temperature', label: 'Température', icon: 'bi-thermometer', unit: '°C', color: '#ef4444' },
    { value: 'humidite', label: 'Humidité', icon: 'bi-droplet', unit: '%', color: '#3b82f6' },
    { value: 'pression', label: 'Pression', icon: 'bi-speedometer2', unit: 'hPa', color: '#8b5cf6' },
    { value: 'vitesse_vent', label: 'Vitesse du vent', icon: 'bi-wind', unit: 'km/h', color: '#10b981' },
    { value: 'nebulosite', label: 'Nébulosité', icon: 'bi-cloud', unit: '%', color: '#f1652eff' },
  ];

  periods = [
    { value: '7days', label: '7 derniers jours' }
  ];

  chartTypes = [
    { value: 'line', label: 'Courbes', icon: 'bi-graph-up' },
    { value: 'bar', label: 'Barres', icon: 'bi-bar-chart' },
    { value: 'radar', label: 'Radar', icon: 'bi-radar' },
  ];

  stats: any[] = [];

  //Dictionaries pour les données des 7 derniers jours
  last7weather : any[]  = [];
  last7meteo :  any[]  = [];
  last7open : any[] = [];

  ngOnInit() {
    this.loadInitialData();
    this.setupDateTime();
    this.onParameterChange(this.selectedParameter);
  }

  setupDateTime() {
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

  loadInitialData() {
    this.isLoading = true;
    this.loadDataForParameter(this.selectedParameter);
  }

  // Chargement des données pour un paramètre donné
  loadDataForParameter(parameter: string) {
    this.isLoading = true;
    
    // Utilisation de forkJoin pour attendre que toutes les requêtes se terminent
    forkJoin({
      weather: this.chercheur_service.getlast7weather(this.searchText, parameter),
      meteo: this.chercheur_service.getlast7meteo(this.searchText, parameter),
      open: this.chercheur_service.getlast7open(this.searchText, parameter)
    }).subscribe({
      next: (responses) => {
        // Traitement des réponses
        if (responses.weather.body.message === "success") {
          this.last7weather = responses.weather.body.last7_weather;
          console.log('7 days Weather API',this.last7weather)

        }
        
        if (responses.meteo.body.message === "success") {
          this.last7meteo = responses.meteo.body.last7_meteo;
          console.log('7 days Open Meteo',this.last7meteo)

        }
        
        if (responses.open.body.message === "success") {
          this.last7open = responses.open.body.last7_open;
          console.log('7 days Open Weather',this.last7open)
        }
        
        // Génération des données une fois toutes les réponses reçues
        this.generateDataFromAPIs();
        this.calculateStats();
        this.createChart();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
        this.isLoading = false;
      }
    });
  }

  //Get last 7 days data Weather API
  getlast7weatheravg(param:string){
    this.chercheur_service.getlast7weather(this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.last7weather = response.body.last7_weather
          //console.log('7 days Weather API',this.last7weather)
        }
      }, error : (error)=>{
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    })
  }

  //Get last 7 days data Open Meteo
  getlast7meteoavg(param:string){
    this.chercheur_service.getlast7meteo(this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.last7meteo = response.body.last7_meteo
          //console.log('7 days Open Meteo',this.last7meteo)
        }
      }, error :(error)=>{
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    })
  }

  //Get last 7 days data Open Weather
  getlast7openavg(param:string){
    this.chercheur_service.getlast7open(this.searchText,param).subscribe({
      next : (response)=>{
        if(response.body.message =="success"){
          this.last7open = response.body.last7_open
          //console.log('7 days Open Weather',this.last7open)
        }
      }, error : (error) =>{
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    })
  }

  // Génération des données à partir des APIs réelles
  generateDataFromAPIs() {
    this.data = [];
    
    // Obtenir toutes les dates uniques des trois sources
    const allDates = this.getAllUniqueDates();
    
    // Pour chaque date, créer un point de données
    allDates.forEach(date => {
      const formattedDate = new Date(date);
      
      this.data.push({
        date: formattedDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        fullDate: date,
        weatherAPI: this.getValueForDate(this.last7weather, date),
        openMeteo: this.getValueForDate(this.last7meteo, date),
        openWeather: this.getValueForDate(this.last7open, date),
        avgSources: (
          (this.getValueForDate(this.last7weather, date) +
          this.getValueForDate(this.last7meteo, date) +
          this.getValueForDate(this.last7open, date)) / 3
        )
      });
    });
    
    // Trier par date croissante
    this.data.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }

  // Obtenir toutes les dates uniques des trois sources
  getAllUniqueDates(): string[] {
    const datesSet = new Set<string>();
    
    // Collecter les dates de Weather API
    if (this.last7weather && Array.isArray(this.last7weather)) {
      this.last7weather.forEach(item => {
        if (item.date) {
          datesSet.add(item.date);
        }
      });
    }
    
    // Collecter les dates d'Open Meteo
    if (this.last7meteo && Array.isArray(this.last7meteo)) {
      this.last7meteo.forEach(item => {
        if (item.date) {
          datesSet.add(item.date);
        }
      });
    }
    
    // Collecter les dates d'Open Weather
    if (this.last7open && Array.isArray(this.last7open)) {
      this.last7open.forEach(item => {
        if (item.date) {
          datesSet.add(item.date);
        }
      });
    }
    
    return Array.from(datesSet).sort();
  }

  // Obtenir la valeur moyenne pour une date donnée dans une source de données
  getValueForDate(dataSource: any[], date: string): number {
    if (!dataSource || !Array.isArray(dataSource)) {
      return 0;
    }
    
    const item = dataSource.find(d => d.date === date);
    return item ? (item.moyenne || 0) : 0;
  }

  onParameterChange(parameter: string) {
    this.selectedParameter = parameter;
    this.loadDataForParameter(parameter);
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    // Pour l'instant, on ne gère que les 7 derniers jours
    if (period === '7days') {
      this.loadDataForParameter(this.selectedParameter);
    }
  }

  onChartTypeChange(type: string) {
    this.chartType = type;
    this.createChart();
  }

calculateStats() {
  const sources = [
    { key: 'weatherAPI', name: 'Weather API' },
    { key: 'openMeteo', name: 'Open Meteo' },
    { key: 'openWeather', name: 'Open Weather' }
  ];
  
  this.stats = sources.map(source => {
    const values = this.data
      .map(d => d[source.key])
      .filter(v => v !== undefined && v !== null && !isNaN(v) && v > 0);
    
    if (values.length === 0) {
      return {
        source: source.key,
        avg: '0.0',
        min: '0.0',
        max: '0.0',
        std: '0.0',
        name: source.name
      };
    }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calcul de l’écart-type
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    return {
      source: source.key,
      avg: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      std: std.toFixed(2), // deux décimales
      name: source.name
    };
  });
}

  createChart() {
    const canvas = document.getElementById('weatherChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: this.chartType as ChartType,
      data: {
        labels: this.data.map(d => d.date),
        datasets: [
          {
            label: 'Weather API',
            data: this.data.map(d => d.weatherAPI),
            borderColor: '#3b82f6',
            backgroundColor: this.chartType === 'line' ? 'transparent' : '#3b82f6',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Open Meteo',
            data: this.data.map(d => d.openMeteo),
            borderColor: '#10b981',
            backgroundColor: this.chartType === 'line' ? 'transparent' : '#10b981',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Open Weather',
            data: this.data.map(d => d.openWeather),
            borderColor: '#eb8a1bff',
            backgroundColor: this.chartType === 'line' ? 'transparent' : '#eb8a1bff',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'Moyenne des 3 sources',
            data: this.data.map(d => d.avgSources),
            borderColor: '#f71717ff',
            backgroundColor: this.chartType === 'line' ? 'transparent' : '#f71717ff',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: this.chartType !== 'radar' ? {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: this.getCurrentParameter().unit
            }
          }
        } : {}
      }
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.labels = this.data.map(d => d.date);
      this.chart.data.datasets[0].data = this.data.map(d => d.weatherAPI);
      this.chart.data.datasets[1].data = this.data.map(d => d.openMeteo);
      this.chart.data.datasets[2].data = this.data.map(d => d.openWeather);
      this.chart.update();
    }
  }

  getCurrentParameter() {
    return this.parameters.find(p => p.value === this.selectedParameter) || this.parameters[0];
  }
}