import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

export interface PrevisionData {
  jour: string;
  date: string;
  temperature: number;
}

export interface WeatherStats {
  avgTemp: number;
  totalPrecip: number;
  maxTemp: number;
  minTemp: number;
}

@Component({
  selector: 'app-etudiantprevision',
  templateUrl: './etudiantprevision.component.html',
  styleUrls: ['./etudiantprevision.component.css']
})
export class EtudiantprevisionComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  predictions: PrevisionData[] = [];
  previsions: any = [];
  dates: any = [];
  loading: boolean = false;
  selected_ville: string = " ";

  viewMode: 'combined' | 'separate' = 'combined';
  stats: WeatherStats = {
    avgTemp: 0,
    totalPrecip: 0,
    maxTemp: 0,
    minTemp: 0
  };

  currentDate: string = '';

  temperatureChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Température (°C)', 
        data: [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  temperatureChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Température (°C)' } },
    },
  };

  villes: string[] = [
    "Dakar", "Thiès", "Tambacounda", "Saint-Louis", "Kaolack", "Dagana", "Touba",
    "Mbour", "Kayar", "Rufisque", "Diourbel", "Ziguinchor", "Kolda", "Kaffrine",
    "Fadiouth", "Kanel", "Sédhiou", "Mekhe", "Fatick", "Ndioum", "Velingara", "Ourossogui",
    "Louga", "Guinguinéo", "Khombole", "Bignona", "Matam", "Bambey", "Thiadiaye", "Sokone",
    "Goudomp", "Gossas", "Kébémer", "Dahra", "Tivaouane", "Bakel", "Pout", "Podor",
    "Linguere", "Koungheul", "Gandiaye", "Pikine"
  ];

  periodes: number[] = [7, 10, 15];
  selected_period: number = 7;

  constructor(private router: Router, private chercheur_service: ChercheurService) {}

  ngOnInit(): void {
    this.currentDate = new Date().toLocaleDateString('fr-FR');
  }

  prepareChartData(): void {
    if (!this.previsions.length) return;

    this.temperatureChartData.labels = [...this.dates];
    this.temperatureChartData.datasets[0].data = [...this.previsions];

    this.chart?.update();
  }

 calculateStats(): void {
  if (!this.previsions || this.previsions.length === 0) {
    this.stats.avgTemp = 0;
    this.stats.maxTemp = 0;
    this.stats.minTemp = 0;
    return;
  }
  let sum = 0
  for(let i=0;i<this.previsions.length;i++){
    sum = sum + this.previsions[i]
    console.log(this.previsions[i])
  }
this.stats.avgTemp = Number((sum / this.previsions.length).toFixed(2));
  this.stats.maxTemp = Math.max(...this.previsions);
  this.stats.minTemp = Math.min(...this.previsions);
}


  onVilleChange(ville: string) {
    this.loading = true;

    this.chercheur_service.get_prevision(ville, this.selected_period).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.previsions = response.body.predictions;
          this.dates = response.body.dates;

          console.log('Ville:', ville);
          console.log('Dates:', this.dates);
          console.log('Prévisions:', this.previsions);

          this.calculateStats();
          this.prepareChartData();
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
      },
    });
  }

  onPeriodeChange(periode: number) {
    this.loading = true;

    this.chercheur_service.get_prevision(this.selected_ville, periode).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.previsions = response.body.predictions;
          this.dates = response.body.dates;

          console.log('Période:', periode);
          console.log('Dates:', this.dates);
          console.log('Prévisions:', this.previsions);

          this.calculateStats();
          this.prepareChartData();
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
      },
    });
  }
}
