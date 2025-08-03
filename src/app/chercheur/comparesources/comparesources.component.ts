// weather-comparison.component.ts
import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { interval, map, startWith } from 'rxjs';

@Component({
  selector: 'app-comparesources',
  templateUrl: './comparesources.component.html',
  styleUrls: ['./comparesources.component.css']
})
export class ComparesourcesComponent implements OnInit {
  selectedParameter = 'temperature';
  selectedPeriod = '7days';
  chartType = 'line';

    // Recherche
  searchText: string = 'Dakar';

  //Current date et time
  dateHeureActuelle$ : any
  
  data: any[] = [];
  chart: Chart | null = null;

  parameters = [
    { value: 'temperature', label: 'Température', icon: 'bi-thermometer', unit: '°C', color: '#ef4444' },
    { value: 'humidity', label: 'Humidité', icon: 'bi-droplet', unit: '%', color: '#3b82f6' },
    { value: 'pressure', label: 'Pression', icon: 'bi-speedometer2', unit: 'hPa', color: '#8b5cf6' },
    { value: 'windSpeed', label: 'Vitesse du vent', icon: 'bi-wind', unit: 'km/h', color: '#10b981' },
    { value: 'uvIndex', label: 'Indice UV', icon: 'bi-sun', unit: '', color: '#f59e0b' },
  ];

  periods = [
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '3months', label: '3 derniers mois' },
    { value: '1year', label: '1 an' },
  ];

  chartTypes = [
    { value: 'line', label: 'Courbes', icon: 'bi-graph-up' },
    { value: 'bar', label: 'Barres', icon: 'bi-bar-chart' },
    { value: 'radar', label: 'Radar', icon: 'bi-radar' },
  ];

  stats: any[] = [];

  ngOnInit() {
    this.generateData();
    this.calculateStats();
    this.createChart();
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

  onParameterChange(parameter: string) {
    this.selectedParameter = parameter;
    this.generateData();
    this.calculateStats();
    this.updateChart();
  }

  onPeriodChange(period: string) {
    this.selectedPeriod = period;
    this.generateData();
    this.calculateStats();
    this.updateChart();
  }

  onChartTypeChange(type: string) {
    this.chartType = type;
    this.createChart();
  }

  generateData() {
    const days = this.selectedPeriod === '7days' ? 7 : 
                 this.selectedPeriod === '30days' ? 30 : 
                 this.selectedPeriod === '3months' ? 90 : 365;
    
    this.data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      let baseValue = 25;
      if (this.selectedParameter === 'humidity') baseValue = 60;
      if (this.selectedParameter === 'pressure') baseValue = 1013;
      if (this.selectedParameter === 'windSpeed') baseValue = 15;
      if (this.selectedParameter === 'uvIndex') baseValue = 5;
      
      this.data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        weatherAPI: +(baseValue + Math.random() * 10 - 5).toFixed(1),
        openMeteo: +(baseValue + Math.random() * 8 - 4).toFixed(1),
        visualCrossing: +(baseValue + Math.random() * 12 - 6).toFixed(1),
      });
    }
  }

  calculateStats() {
    const sources = ['weatherAPI', 'openMeteo', 'visualCrossing'];
    this.stats = sources.map(source => {
      const values = this.data.map(d => d[source]);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      return {
        source,
        avg: avg.toFixed(1),
        min: min.toFixed(1),
        max: max.toFixed(1),
        name: source === 'weatherAPI' ? 'Weather API' : 
              source === 'openMeteo' ? 'Open Meteo' : 'Visual Crossing'
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
            label: 'Visual Crossing',
            data: this.data.map(d => d.visualCrossing),
            borderColor: '#f59e0b',
            backgroundColor: this.chartType === 'line' ? 'transparent' : '#f59e0b',
            borderWidth: 2,
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
      this.chart.data.datasets[2].data = this.data.map(d => d.visualCrossing);
      this.chart.update();
    }
  }

  getCurrentParameter() {
    return this.parameters.find(p => p.value === this.selectedParameter) || this.parameters[0];
  }

  getCurrentTime() {
    return new Date().toLocaleString('fr-FR');
  }
}