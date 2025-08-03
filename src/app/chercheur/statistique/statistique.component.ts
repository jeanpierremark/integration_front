// weather-dashboard.component.ts - Version simplifiée
import { Component, OnInit, OnDestroy } from '@angular/core';

interface SourceData {
  name: string;
  color: string;
  icon: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  uvIndex: number;
  lastUpdate: string;
  status: 'active' | 'inactive' | 'error';
}

interface Parameter {
  key: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'lastUpdate' | 'status'>;
  label: string;
  unit: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-statistique',
  templateUrl: './statistique.component.html',
  styleUrls: ['./statistique.component.css']
})
export class StatistiqueComponent implements OnInit, OnDestroy {
  selectedParameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'lastUpdate' | 'status'> = 'temperature';
  
  // Données des différentes sources météo
  sources: SourceData[] = [
    {
      name: 'Weather API',
      color: '#3b82f6',
      icon: 'bi-cloud',
      temperature: 22.8,
      humidity: 68,
      pressure: 1013.2,
      windSpeed: 15.4,
      uvIndex: 6,
      lastUpdate: '2 min',
      status: 'active'
    },
    {
      name: 'Open Meteo',
      color: '#10b981',
      icon: 'bi-globe',
      temperature: 22.3,
      humidity: 67,
      pressure: 1012.8,
      windSpeed: 14.8,
      uvIndex: 5,
      lastUpdate: '1 min',
      status: 'active'
    },
    {
      name: 'Visual Crossing',
      color: '#f59e0b',
      icon: 'bi-graph-up',
      temperature: 23.1,
      humidity: 69,
      pressure: 1013.5,
      windSpeed: 16.2,
      uvIndex: 6,
      lastUpdate: '3 min',
      status: 'active'
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
      key: 'uvIndex', 
      label: 'Indice UV', 
      unit: '', 
      icon: 'bi-sun', 
      color: '#f59e0b' 
    }
  ];

  private refreshInterval: any;

  ngOnInit() {
    this.startRefresh();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private startRefresh() {
    // Actualiser les données toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.updateSourcesData();
    }, 30000);
  }

  private updateSourcesData() {
    this.sources.forEach(source => {
      // Simuler des variations de données
      source.temperature += (Math.random() - 0.5) * 2;
      source.humidity += Math.floor((Math.random() - 0.5) * 4);
      source.pressure += (Math.random() - 0.5) * 2;
      source.windSpeed += (Math.random() - 0.5) * 3;
      source.uvIndex = Math.max(0, Math.min(11, source.uvIndex + Math.floor((Math.random() - 0.5) * 2)));
      
      // Arrondir les valeurs
      source.temperature = Math.round(source.temperature * 10) / 10;
      source.humidity = Math.max(0, Math.min(100, Math.round(source.humidity)));
      source.pressure = Math.round(source.pressure * 10) / 10;
      source.windSpeed = Math.round(source.windSpeed * 10) / 10;
      
      // Mettre à jour le timestamp
      source.lastUpdate = Math.floor(Math.random() * 5 + 1) + ' min';
    });
  }

  onParameterChange(parameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'lastUpdate' | 'status'>) {
    this.selectedParameter = parameter;
  }

  getCurrentParameter(): Parameter {
    return this.parameters.find(p => p.key === this.selectedParameter) || this.parameters[0];
  }

  getParameterValue(source: SourceData, parameter: keyof Omit<SourceData, 'name' | 'color' | 'icon' | 'lastUpdate' | 'status'>): number {
    return source[parameter];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-warning';
      case 'error': return 'text-danger';
      default: return 'text-muted';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'bi-check-circle-fill';
      case 'inactive': return 'bi-pause-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  }

  // Calculer les statistiques comparatives
  getMinValue(): number {
    const values = this.sources.map(s => this.getParameterValue(s, this.selectedParameter));
    return Math.min(...values);
  }

  getMaxValue(): number {
    const values = this.sources.map(s => this.getParameterValue(s, this.selectedParameter));
    return Math.max(...values);
  }

  getAverageValue(): number {
    const values = this.sources.map(s => this.getParameterValue(s, this.selectedParameter));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10;
  }

  getDifference(): number {
    return Math.round((this.getMaxValue() - this.getMinValue()) * 10) / 10;
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('fr-FR');
  }
}