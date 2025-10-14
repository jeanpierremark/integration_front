import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';

export interface PrevisionData {
  jour: string;
  date: string;
  temperature: number;
  precipitation: number;
  humidite: number;
}

export interface WeatherStats {
  avgTemp: number;
  totalPrecip: number;
  maxTemp: number;
  minTemp: number;
}

@Component({
  selector: 'app-prevision',
  templateUrl: './prevision.component.html',
  styleUrls: ['./prevision.component.css']
})
export class PrevisionComponent implements OnInit {
  predictions: PrevisionData[] = [
    { jour: 'Lun 18', date: '2025-09-18', temperature: 22, precipitation: 0.2, humidite: 65 },
    { jour: 'Mar 19', date: '2025-09-19', temperature: 24, precipitation: 1.5, humidite: 70 },
    { jour: 'Mer 20', date: '2025-09-20', temperature: 21, precipitation: 3.2, humidite: 78 },
    { jour: 'Jeu 21', date: '2025-09-21', temperature: 19, precipitation: 5.8, humidite: 85 },
    { jour: 'Ven 22', date: '2025-09-22', temperature: 17, precipitation: 8.4, humidite: 90 },
    { jour: 'Sam 23', date: '2025-09-23', temperature: 16, precipitation: 12.1, humidite: 95 },
    { jour: 'Dim 24', date: '2025-09-24', temperature: 18, precipitation: 6.7, humidite: 82 },
    { jour: 'Lun 25', date: '2025-09-25', temperature: 20, precipitation: 2.3, humidite: 72 },
    { jour: 'Mar 26', date: '2025-09-26', temperature: 23, precipitation: 0.8, humidite: 68 },
    { jour: 'Mer 27', date: '2025-09-27', temperature: 25, precipitation: 0.1, humidite: 62 }
  ];

  viewMode: 'combined' | 'separate' = 'combined';
  stats: WeatherStats = {
    avgTemp: 0,
    totalPrecip: 0,
    maxTemp: 0,
    minTemp: 0
  };

  chartData: any[] = [];
  currentDate: string = '';
  constructor(private router: Router, private chercheur_service : ChercheurService) {}

  ngOnInit(): void {
    this.calculateStats();
    this.prepareChartData();
    this.currentDate = new Date().toLocaleDateString('fr-FR');
    this.onPeriodeChange(this.selected_period)
    this.onVilleChange(this.selected_ville)
  }

  calculateStats(): void {
    const temps = this.predictions.map(p => p.temperature);
    const precips = this.predictions.map(p => p.precipitation);

    this.stats = {
      avgTemp: +(temps.reduce((sum, temp) => sum + temp, 0) / temps.length).toFixed(1),
      totalPrecip: +(precips.reduce((sum, precip) => sum + precip, 0)).toFixed(1),
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps)
    };
  }

  prepareChartData(): void {
    this.chartData = this.predictions.map(pred => ({
      ...pred,
      tempHeight: this.getBarHeight(pred.temperature, 'temperature'),
      precipHeight: this.getBarHeight(pred.precipitation, 'precipitation')
    }));
  }

  getBarHeight(value: number, type: 'temperature' | 'precipitation'): number {
    if (type === 'temperature') {
      const max = Math.max(...this.predictions.map(p => p.temperature));
      const min = Math.min(...this.predictions.map(p => p.temperature));
      return ((value - min) / (max - min)) * 200 + 20; // Min 20px, max 220px
    } else {
      const max = Math.max(...this.predictions.map(p => p.precipitation));
      if (max === 0) return 0;
      return (value / max) * 200; // Max 200px
    }
  }

  getWeatherIcon(temp: number, precip: number): string {
    if (precip > 5) return '🌧️';
    if (precip > 1) return '☁️';
    if (temp > 23) return '☀️';
    return '⛅';
  }

  getWeatherClass(temp: number, precip: number): string {
    if (precip > 5) return 'rainy';
    if (precip > 1) return 'cloudy';
    if (temp > 23) return 'sunny';
    return 'partly-cloudy';
  }

  setViewMode(mode: 'combined' | 'separate'): void {
    this.viewMode = mode;
  }

  getTempColor(temp: number): string {
    if (temp >= 25) return '#ef4444'; // Rouge chaud
    if (temp >= 20) return '#f97316'; // Orange
    if (temp >= 15) return '#eab308'; // Jaune
    return '#3b82f6'; // Bleu froid
  }

  getPrecipColor(precip: number): string {
    if (precip >= 10) return '#1e40af'; // Bleu foncé
    if (precip >= 5) return '#3b82f6';  // Bleu
    if (precip >= 1) return '#60a5fa';  // Bleu clair
    return '#dbeafe'; // Bleu très clair
  }

  // Méthodes pour les graphiques personnalisés
  getChartPoints(type: 'temperature' | 'precipitation'): string {
    const width = 800;
    const height = 200;
    const stepX = width / (this.predictions.length - 1);
    
    let points = '';
    
    this.predictions.forEach((pred, index) => {
      let value: number;
      let max: number;
      let min: number;
      
      if (type === 'temperature') {
        value = pred.temperature;
        max = Math.max(...this.predictions.map(p => p.temperature));
        min = Math.min(...this.predictions.map(p => p.temperature));
      } else {
        value = pred.precipitation;
        max = Math.max(...this.predictions.map(p => p.precipitation));
        min = 0;
      }
      
      const x = index * stepX;
      const y = height - ((value - min) / (max - min)) * height;
      
      points += `${x},${y} `;
    });
    
    return points.trim();
  }


  villes: string[] = [
  "Dakar", "Thiès", "Tambacounda", "Saint-Louis", "Kaolack", "Dagana", "Touba",
  "Mbour", "Kayar", "Rufisque", "Diourbel", "Ziguinchor", "Kolda", "Kaffrine",
  "Fadiouth", "Kanel", "Sédhiou", "Mekhe", "Fatick", "Ndioum", "Velingara", "Ourossogui",
  "Louga", "Guinguinéo", "Khombole", "Bignona", "Matam", "Bambey", "Thiadiaye", "Sokone",
  "Goudomp", "Gossas", "Kébémer", "Dahra", "Tivaouane", "Bakel", "Pout", "Podor", 
  "Linguere", "Koungheul", "Gandiaye", "Pikine"
];

selected_ville: string = "Dakar";

periodes : number[] = [7,10,15]
selected_period:number = 7

min : any 
max : any
mean_temp : any
previsions : any =[]
dates : any = []

loading : boolean = false
onVilleChange(ville: string) {
  this.loading = true
   this.chercheur_service.get_prevision(ville,this.selected_period).subscribe({
    next : (response) =>{
      if (response.body.message == 'success'){
        this.previsions = response.body.predictions
        this.dates = response.body.dates
      }
      console.log('Previsions',this.previsions)
      console.log('Dates',this.dates)
      console.log('Ville',this.selected_ville)
      console.log('Periode',this.selected_period)
      this.loading = false

    }
   }
   )
}

onPeriodeChange(periode: number) {
  this.loading = true
   this.chercheur_service.get_prevision(this.selected_ville,periode).subscribe({
    next : (response) =>{
      if (response.body.message == 'success'){
        this.previsions = response.body.predictions
        this.dates = response.body.dates
      }
      console.log('Previsions',this.previsions)
      console.log('Dates',this.dates)
      console.log('Ville',this.selected_ville)
      console.log('Period',this.selected_period)
      this.loading = false

    }
   }
   )
}

}