import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { interval, map, startWith } from 'rxjs';
import { ChercheurService } from 'src/app/services/chercheur.service';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';

interface ClimateParameter {
  value: string;
  label: string;
  icon: string;
  unit: string;
  color: string;
  back: string;
}

interface Period {
  value: string;
  label: string;
  icon: string;
}

interface Source {
  value: string;
  label: string;
  description: string;
}

interface AnalysisResult {
  value: string;
  label: string;
  color: string;
  status: string;
  statusText: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

interface MetricStatistics {
  "25%": number;
  "50%": number;
  "75%": number;
  count: number;
  max: number;
  mean: number;
  min: number;
  std: number;
}

interface CityMetrics {
  [metricName: string]: MetricStatistics;
}

interface Statistics {
  [cityName: string]: CityMetrics;
}

interface TrendAnalysis {
  data_points: number;
  intercept: number;
  p_value: number;
  r_value: number;
  slope: number;
  std_err: number;
  total_increase: number;
  trend_direction: string;
}

interface CityTrends {
  [parameter: string]: TrendAnalysis;
}

interface TrendsData {
  [cityName: string]: CityTrends;
}

interface CorrelationMatrix {
  [variable: string]: {
    [otherVariable: string]: number;
  };
}

interface RegionCorrelation {
  correlation_matrix: CorrelationMatrix;
  data_points: number;
}

interface Correlations {
  [region: string]: RegionCorrelation;
}

interface CorrelationPair {
  param1: string;
  param2: string;
  value: number;
}

interface CompareData {
  averages: {
    [cityName: string]: {
      [metric: string]: number;
    };
  };
  differences: {
    [metric: string]: {
      [comparison: string]: number;
    };
  };
}

@Component({
  selector: 'app-analyseavance',
  templateUrl: './analyseavance.component.html',
  styleUrls: ['./analyseavance.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyseavanceComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('averagesChart', { static: false }) averagesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('differencesChart', { static: false }) differencesChartRef!: ElementRef<HTMLCanvasElement>;

  private averagesChart?: Chart;
  private differencesChart?: Chart;
  user_id : any =  sessionStorage.getItem('id')
  action = ''
  statut : boolean = false
  constructor(
    private router: Router,
    private chercheur_service: ChercheurService,
    private user_service : UserService,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  // Configuration d'analyse
  selectedMethod: string = ''; 
  selectedParameters: string[] = ['temperature'];
  selectedPeriod: string = '7d';
  selectedSource: string = 'climate_data_weather';
  searchText: string = 'Thiès';

  // Configuration des villes
  selectedCities: string[] = ['Dakar'];
  citySearchText: string = '';
  filteredCities: string[] = [];

  // Liste des villes du Sénégal
  allCities: string[] = [
    "Dakar", "Thiès", "Tambacounda", "Saint-Louis", "Kaolack", "Dagana", "Touba",
    "Mbour", "Kayar", "Rufisque", "Diourbel", "Ziguinchor", "Kolda", "Kaffrine",
    "Fadiouth", "Kanel", "Sédhiou", "Mekhe", "Fatick", "Ndioum", "Velingara", "Ourossogui",
    "Louga", "Guinguinéo", "Khombole", "Bignona", "Matam", "Bambey", "Thiadiaye", "Sokone",
    "Goudomp", "Gossas", "Kébémer", "Dahra", "Tivaouane", "Bakel", "Pout", "Podor",
    "Linguere", "Koungheul", "Gandiaye", "Pikine"
  ];

  // Villes principales pour la sélection rapide
  majorCities: string[] = ["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Tambacounda", "Ziguinchor", "Touba", "Mbour"];

  // États
  loading = false;
  analysisResults: AnalysisResult[] | null = null;
  notifications: Notification[] = [];

  // Date et heure
  dateHeureActuelle$ = interval(1000).pipe(
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

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Configuration des paramètres
  parameters: ClimateParameter[] = [
    { value: 'temperature', label: 'Température', icon: 'bi-thermometer', unit: '°C', color: '#ff481fff', back: '#ebffedff' },
    { value: 'humidite', label: 'Humidité', icon: 'bi-droplet', unit: '%', color: '#0c64f2ff', back: '#e3ebf9ff' },
    { value: 'precipitation', label: 'Précipitation', icon: 'bi-cloud-drizzle', unit: 'mm', color: '#04206eff', back: '#e7ebf7ff' },
    { value: 'pression', label: 'Pression', icon: 'bi-speedometer2', unit: 'hPa', color: '#0704bdff', back: '#e2daf7ff' },
    { value: 'vitesse_vent', label: 'Vitesse du vent', icon: 'bi-wind', unit: 'km/h', color: '#905af6ff', back: '#e4f1edff' },
    { value: 'nebulosite', label: 'Nébulosité', icon: 'bi-cloud-fog2', unit: '%', color: '#68b1faff', back: '#e7e5f7ff' }
  ];

  // Configuration des périodes
  periods: Period[] = [
    { value: '7d', label: '7 derniers jours', icon: 'bi-calendar-week' },
    { value: '30d', label: '30 derniers jours', icon: 'bi-calendar-month' },
    { value: '1an', label: 'dernière année', icon: 'bi-calendar3' },
    { value: '10ans', label: '10 dernières années', icon: 'bi-calendar3' },
    { value: '15ans', label: '15 dernières années', icon: 'bi-calendar3' },
    { value: '20ans', label: '20 dernières années', icon: 'bi-calendar3' },
  ];

  // Configuration des sources
  sources: Source[] = [
    { value: 'climate_data_weather', label: 'Weather API', description: 'Service commercial avec offre gratuite limitée' },
    { value: 'climate_data_openweather', label: 'Open Weather', description: 'Service gratuit, données fiables' },
    { value: 'climate_data_openmeteo', label: 'Open Meteo', description: 'Service gratuit et open sans clé d\'API' },
    { value: 'climate_data_integration', label: 'Nasa Power', description: 'Données climatiques historiques' }
  ];

  // Disponibilité des sources par période
  private sourceAvailability: { [period: string]: { [source: string]: 'available' | 'limited' | 'unavailable' } } = {
    '1h': { 'climate_data_weather': 'available', 'climate_data_openweather': 'available', 'climate_data_openmeteo': 'available', 'climate_data_integration': 'unavailable' },
    '6h': { 'climate_data_weather': 'available', 'climate_data_openweather': 'available', 'climate_data_openmeteo': 'available', 'climate_data_integration': 'unavailable' },
    '24h': { 'climate_data_weather': 'available', 'climate_data_openweather': 'available', 'climate_data_openmeteo': 'available', 'climate_data_integration': 'unavailable' },
    '7d': { 'climate_data_weather': 'available', 'climate_data_openweather': 'available', 'climate_data_openmeteo': 'available', 'climate_data_integration': 'unavailable' },
    '30d': { 'climate_data_weather': 'available', 'climate_data_openweather': 'available', 'climate_data_openmeteo': 'available', 'climate_data_integration': 'unavailable' },
    '1an': { 'climate_data_weather': 'unavailable', 'climate_data_openweather': 'unavailable', 'climate_data_openmeteo': 'unavailable', 'climate_data_integration': 'available' },
    '10ans': { 'climate_data_weather': 'unavailable', 'climate_data_openweather': 'unavailable', 'climate_data_openmeteo': 'unavailable', 'climate_data_integration': 'available' },
    '15ans': { 'climate_data_weather': 'unavailable', 'climate_data_openweather': 'unavailable', 'climate_data_openmeteo': 'unavailable', 'climate_data_integration': 'available' },
    '20ans': { 'climate_data_weather': 'unavailable', 'climate_data_openweather': 'unavailable', 'climate_data_openmeteo': 'unavailable', 'climate_data_integration': 'available' }
  };

  // Données pour les analyses
  descriptive: { statistics: Statistics } = { statistics: {} };
  correlation: Correlations = {};
  tendance: TrendsData = {};
  compare: CompareData = { averages: {}, differences: {} };

  ngOnInit() {
    this.initializeComponent();
    this.loadAnalysisMethod();
  }

  ngAfterViewInit() {
    // Pas d'appel direct ici, car createAveragesChart est appelé après réception des données
  }

  ngOnDestroy() {
    if (this.averagesChart) {
      this.averagesChart.destroy();
    }
    if (this.differencesChart) {
      this.differencesChart.destroy();
    }
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

  private async initializeComponent(): Promise<void> {
    try {
      this.loading = true;
      this.cdr.detectChanges();
      await this.loadInitialData();
      this.filterCities();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      this.showNotification('Erreur lors de l\'initialisation', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

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
        this.action ='L\'utilisateur à télécharger un résulat d\'analyse'
        this.statut = true
        this.save_do_something(this.user_id,this.action,this.statut)
      }).catch((error: Error) => {
        console.error('Erreur lors de la création de l\'image:', error);
      });
    };
    script.onerror = (): void => {
      console.error('Erreur lors du chargement de html2canvas.');
       this.action ='L\'utilisateur tente télécharger un résulat d\'analyse'
        this.statut = false
        this.save_do_something(this.user_id,this.action,this.statut)
    };
    document.head.appendChild(script);
  }

  get selectedPeriodLabel(): string {
    return this.periods.find(p => p.value === this.selectedPeriod)?.label || '';
  }

  getDescriptiveAnalysis() {
    this.loading = true;
    this.chercheur_service.get_descriptive_analysis(
      this.selectedCities, this.selectedSource, this.selectedParameters, this.selectedPeriod
    ).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.descriptive.statistics = response.body.statistics;
          this.loading = false;
          this.showNotification('Analyse terminée avec succès', 'success');
          console.log("Descriptive", this.descriptive);

        }
        this.action ='L\'utilisateur à lancer une analyse descriptive '
        this.statut = true
        console.log('User',this.user_id)
        this.save_do_something(this.user_id,this.action,this.statut)
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showNotification(error.error.error, 'error');
        this.action ='L\'utilisateur tente de lancer une analyse descriptive '
        this.statut = false
        console.log('User',this.user_id)
        this.save_do_something(this.user_id,this.action,this.statut)
        this.cdr.detectChanges();
      }
    });
  }

  getTendancesAnalysis() {
    this.loading = true;
    this.chercheur_service.get_trend_analysis(
      this.selectedCities, this.selectedSource, this.selectedParameters, this.selectedPeriod
    ).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.tendance = response.body.trends;
          this.loading = false;
          this.showNotification('Analyse terminée avec succès', 'success');
          console.log("Trends", this.tendance);
        }
        this.action ='L\'utilisateur à lancer une analyse tendance '
        this.statut = true
        console.log('User',this.user_id)

        this.save_do_something(this.user_id,this.action,this.statut)

        console.log(this.action)
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showNotification(error.error.error, 'error');
        this.action ='L\'utilisateur tente de  lancer une analyse de tendance '
        this.statut = false
        this.save_do_something(this.user_id,this.action,this.statut)
        this.cdr.detectChanges();
      }
    });
  }

  formatSlope(slope: number): string {
    if (!slope) return '0.000000';
    if (Math.abs(slope) < 0.000001) {
      return slope.toExponential(3);
    }
    return slope.toFixed(6);
  }

  getTrendLabel(direction: string): string {
    const labels: { [key: string]: string } = {
      'croissante': 'En hausse',
      'décroissante': 'En baisse',
      'stable': 'Stable'
    };
    return labels[direction] || 'Indéterminé';
  }

  getReliabilityLabel(pValue: number): string {
    if (!pValue) return 'Non calculé';
    if (pValue < 0.01) return 'Très significatif';
    else if (pValue < 0.05) return 'Significatif';
    else return 'Non significatif';
  }

  hasTrendData(city: string, parameter: string): boolean {
    return this.tendance && this.tendance[city] && this.tendance[city][parameter] && this.tendance[city][parameter].slope !== undefined;
  }

  getAvailableCitiesForTrends(): string[] {
    if (!this.tendance) return [];
    return Object.keys(this.tendance);
  }

  getAvailableParametersForCity(city: string): string[] {
    if (!this.tendance || !this.tendance[city]) return [];
    return Object.keys(this.tendance[city]);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  hasTrendanceData(): boolean {
    return this.tendance && Object.keys(this.tendance).length > 0;
  }

  getCorrelationAnalysis() {
    this.loading = true;
    this.chercheur_service.get_correlation_analysis(
      this.selectedCities, this.selectedSource, this.selectedParameters, this.selectedPeriod
    ).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.correlation = response.body.correlations;
          this.loading = false;
          this.showNotification('Analyse terminée avec succès', 'success');
          console.log("Correlation", this.correlation);
        }
        this.action ='L\'utilisateur à lancer une analyse de corrélation '
        this.statut = true
        console.log('User',this.user_id)
        this.save_do_something(this.user_id,this.action,this.statut)
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showNotification(error.error.error, 'error');
        this.action ='L\'utilisateur tente de  lancer une analyse de corrélation '
        this.statut = false
        this.save_do_something(this.user_id,this.action,this.statut)
        this.cdr.detectChanges();
      }
    });
  }

  hasCorrelationData(): boolean {
    return this.correlation && Object.keys(this.correlation).length > 0;
  }

  getParametersFromMatrix(city: string): string[] {
    if (!this.correlation[city] || !this.correlation[city].correlation_matrix) return [];
    return Object.keys(this.correlation[city].correlation_matrix);
  }

  getCorrelationValue(city: string, param1: string, param2: string): number {
    if (!this.correlation[city] || !this.correlation[city].correlation_matrix[param1] || this.correlation[city].correlation_matrix[param1][param2] === undefined) return 0;
    return this.correlation[city].correlation_matrix[param1][param2];
  }

  formatCorrelationValue(value: number): string {
    if (value === 0) return '0.00';
    return value.toFixed(3);
  }

  getCorrelationInterpretation(value: number): string {
    const absValue = Math.abs(value);
    const direction = value > 0 ? 'positive' : 'négative';
    if (absValue === 1) return `Corrélation parfaite ${direction}`;
    else if (absValue >= 0.8) return `Corrélation très forte ${direction}`;
    else if (absValue >= 0.6) return `Corrélation forte ${direction}`;
    else if (absValue >= 0.4) return `Corrélation modérée ${direction}`;
    else if (absValue >= 0.2) return `Corrélation faible ${direction}`;
    else if (absValue > 0) return `Corrélation très faible ${direction}`;
    else return 'Aucune corrélation';
  }

  getSignificantCorrelations(city: string): CorrelationPair[] {
    if (!this.correlation[city] || !this.correlation[city].correlation_matrix) return [];
    const pairs: CorrelationPair[] = [];
    const matrix = this.correlation[city].correlation_matrix;
    const params = Object.keys(matrix);
    const threshold = 0.3;

    for (let i = 0; i < params.length; i++) {
      for (let j = i + 1; j < params.length; j++) {
        const param1 = params[i];
        const param2 = params[j];
        const value = matrix[param1][param2];
        if (Math.abs(value) >= threshold) {
          pairs.push({ param1, param2, value });
        }
      }
    }
    return pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }

  countPositiveCorrelations(city: string): number {
    return this.getSignificantCorrelations(city).filter(pair => pair.value > 0).length;
  }

  countNegativeCorrelations(city: string): number {
    return this.getSignificantCorrelations(city).filter(pair => pair.value < 0).length;
  }

  getStrongestCorrelation(city: string): string {
    const significantCorrelations = this.getSignificantCorrelations(city);
    if (significantCorrelations.length === 0) return 'Aucune';
    const strongest = significantCorrelations[0];
    return `${this.getParameterLabel(strongest.param1)} ↔ ${this.getParameterLabel(strongest.param2)} (${this.formatCorrelationValue(strongest.value)})`;
  }

  getComparativeAnalysis() {
    this.loading = true;
    this.cdr.detectChanges();
    this.chercheur_service.get_direct_comparaison(
      this.selectedCities, this.selectedSource, this.selectedParameters, this.selectedPeriod
    ).subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.compare = {
            averages: response.body.averages,
            differences: response.body.differences
          };
          this.loading = false;
          this.showNotification('Analyse terminée avec succès', 'success');
          console.log('Comparative', this.compare);
          this.createAveragesChart();
          this.cdr.detectChanges();
        this.action ='L\'utilisateur à lancer une analyse comparative '
        this.statut = true
        console.log('User',this.user_id)

        this.save_do_something(this.user_id,this.action,this.statut)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showNotification(error.error.error, 'error');
        console.error('Erreur API:', error);
        this.action ='L\'utilisateur tente  une analyse comparative '
        this.statut = false
        this.save_do_something(this.user_id,this.action,this.statut)
        this.cdr.detectChanges();
      }
    });
  }

  createAveragesChart() {
    if (!this.averagesChartRef || !this.compare || !this.compare.averages || !this.selectedCities.length || !this.selectedParameters.length) {
      console.warn('Données manquantes pour créer le graphique des moyennes');
      return;
    }

    const ctx = this.averagesChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Contexte 2D non disponible pour averagesChart');
      return;
    }

    if (this.averagesChart) {
      this.averagesChart.destroy();
    }

    const datasets = this.selectedCities.map((city, index) => {
      const data = this.selectedParameters.map(param => 
        this.compare.averages[city]?.[param] ?? 0
      );
      return {
        label: city,
        data: data,
        backgroundColor: this.getCityColor(city, 0.6),
        borderColor: this.getCityColor(city, 1),
        borderWidth: 2
      };
    });

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: this.selectedParameters.map(param => this.getParameterLabel(param)),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Comparaison des moyennes par ville'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valeurs'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Paramètres'
            }
          }
        }
      }
    };

    this.averagesChart = new Chart(ctx, config);
    this.cdr.detectChanges();
  }

  private getCityColor(city: string, alpha: number = 1): string {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`
    ];
    const index = this.selectedCities.indexOf(city) % colors.length;
    return colors[index];
  }

  getParameterColor(param: string, alpha: number = 1): string {
    const colors = {
      'temperature': `#ff481fff`,
      'humidite': `#0c64f2ff`,
      'precipitation': `#04206eff`,
      'pression': `#0704bdff`,
      'vitesse_vent': `#905af6ff`,
      'nebulosite': `#68b1faff`
    };
    return colors[param as keyof typeof colors] || `rgba(128, 128, 128, ${alpha})`;
  }

  public updateComparisonCharts() {
    if (this.selectedMethod === 'compare' && this.compare) {
      this.createAveragesChart();
    }
  }

  loadAnalysisMethod() {
    if(this.selectedMethod != ''){
    if (this.selectedMethod === 'trend') {
      this.getTendancesAnalysis();
    } else if (this.selectedMethod === 'descriptive') {
      this.getDescriptiveAnalysis();
    } else if (this.selectedMethod === 'correlation') {
      this.getCorrelationAnalysis();
    } else {
      this.getComparativeAnalysis();
    }
    }
  }

  private async loadInitialData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  filterCities(): void {
    if (!this.citySearchText.trim()) {
      this.filteredCities = [...this.allCities];
    } else {
      const searchTerm = this.citySearchText.toLowerCase().trim();
      this.filteredCities = this.allCities.filter(city => 
        city.toLowerCase().includes(searchTerm)
      );
    }
    this.cdr.detectChanges();
  }

  toggleCity(city: string): void {
    const index = this.selectedCities.indexOf(city);
    if (index > -1) {
      if (this.selectedCities.length > 1) {
        this.selectedCities.splice(index, 1);
      } else {
        this.showNotification('Au moins une ville doit être sélectionnée', 'warning');
      }
    } else {
      this.selectedCities.push(city);
    }
    console.log('Villes sélectionnées:', this.selectedCities);
   
    this.cdr.detectChanges();
  }

  selectMajorCities(): void {
    this.selectedCities = [...this.majorCities];
    this.showNotification(`${this.majorCities.length} villes principales sélectionnées`, 'info');
    
    this.cdr.detectChanges();
  }

  selectAllCities(): void {
    this.selectedCities = [...this.allCities];
    this.showNotification(`Toutes les villes sélectionnées (${this.allCities.length})`, 'info');
    
    this.cdr.detectChanges();
  }

  clearAllCities(): void {
    if (this.selectedCities.length > 1) {
      this.selectedCities = [this.selectedCities[0]];
      this.showNotification('Toutes les villes désélectionnées sauf une', 'info');
    } else {
      this.showNotification('Au moins une ville doit rester sélectionnée', 'warning');
    }
    if (this.selectedMethod === 'compare') {
      this.getComparativeAnalysis();
    }
    this.cdr.detectChanges();
  }

  trackByCity(index: number, city: string): string {
    return city;
  }

  selectMethod(method: string): void {
    this.selectedMethod = method;
    console.log('Méthode sélectionnée:', method);
    //this.loadAnalysisMethod();
    this.cdr.detectChanges();
  }

  toggleParameter(parameter: string): void {
    const index = this.selectedParameters.indexOf(parameter);
    if (index > -1) {
      if (this.selectedParameters.length > 1) {
        this.selectedParameters.splice(index, 1);
      }
    } else {
      this.selectedParameters.push(parameter);
    }
    console.log('Paramètres sélectionnés:', this.selectedParameters);
    
    this.cdr.detectChanges();
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    const currentSourceAvailability = this.getSourceAvailability(this.selectedSource);
    if (currentSourceAvailability === 'unavailable') {
      this.selectFirstAvailableSource();
    }
    console.log('Période sélectionnée:', period);
    
    this.cdr.detectChanges();
  }

  selectSource(source: string): void {
    const availability = this.getSourceAvailability(source);
    if (availability === 'unavailable') {
      this.showNotification('Cette source n\'est pas disponible pour la période sélectionnée', 'warning');
      return;
    }
    this.selectedSource = source;
    console.log('Source sélectionnée:', source);
    
    this.cdr.detectChanges();
  }

  private selectFirstAvailableSource(): void {
    for (const source of this.sources) {
      if (this.getSourceAvailability(source.value) !== 'unavailable') {
        this.selectedSource = source.value;
        break;
      }
    }
  }

  async updateAnalysis(): Promise<void> {
    if (!this.searchText.trim()) {
      this.showNotification('Veuillez entrer une localisation', 'warning');
      return;
    }
    try {
      this.loading = true;
      this.cdr.detectChanges();
      await this.loadDataForLocation(this.searchText);
      this.showNotification(`Données mises à jour pour ${this.searchText}`, 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      this.showNotification('Erreur lors de la mise à jour des données', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async launchAnalysis(): Promise<void> {
    if (!this.canLaunchAnalysis()) {
      return;
    }
    try {
      this.loading = true;
      this.cdr.detectChanges();
      const citiesCount = this.selectedCities.length;
      const parametersCount = this.selectedParameters.length;
      this.showNotification(
        `Analyse en cours pour ${citiesCount} ville(s) et ${parametersCount} paramètre(s)`,
        'info'
      );
      this.showNotification('Analyse terminée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      this.showNotification('Erreur lors de l\'analyse', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async loadDataForLocation(location: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  getSourceAvailability(sourceValue: string): 'available' | 'limited' | 'unavailable' {
    const value = this.sourceAvailability[this.selectedPeriod]?.[sourceValue];
    if (value === 'available' || value === 'limited' || value === 'unavailable') {
      return value;
    }
    return 'unavailable';
  }

  getSourceAvailabilityText(sourceValue: string): string {
    const status = this.getSourceAvailability(sourceValue);
    switch (status) {
      case 'available': return 'Disponible';
      case 'limited': return 'Limité';
      case 'unavailable': return 'Indisponible';
      default: return 'Inconnu';
    }
  }

  canLaunchAnalysis(): boolean {
    return this.selectedParameters.length > 0 &&
           this.selectedCities.length > 0 &&
           !!this.selectedMethod &&
           !!this.selectedPeriod &&
           !!this.selectedSource &&
           this.getSourceAvailability(this.selectedSource) !== 'unavailable' &&
           !this.loading;
  }

  trackByParameter(index: number, parameter: ClimateParameter): string {
    return parameter.value;
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    Swal.fire({
      toast: true,
      icon: type,
      title: message,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      customClass: {
        timerProgressBar: this.getProgressBarClass(type)
      }
    });
    this.cdr.detectChanges();
  }

  getProgressBarClass(type: string): string {
    switch (type) {
      case 'success': return 'custom-progress-bar-success';
      case 'error': return 'custom-progress-bar-error';
      case 'warning': return 'custom-progress-bar-warning';
      case 'info': return 'custom-progress-bar-info';
      default: return 'custom-progress-bar';
    }
  }

  removeNotification(notification: Notification): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  getDifferenceCityPairs(param: string): string[] {
    return Object.keys(this.compare?.differences?.[param] || {});
  }

  getParameterLabel(param: string): string {
    return this.parameters?.find(p => p.value === param)?.label || param;
  }

  getParameterUnit(param: string): string {
    return this.parameters?.find(p => p.value === param)?.unit || '';
  }

  getCorrelationStatusClass(city: string, param1: string, param2: string): string {
    const value = this.correlation?.[city]?.correlation_matrix?.[param1]?.[param2];
    if (value === undefined) return 'weak';
    const absValue = Math.abs(value);
    return absValue > 0.7 ? 'strong' : absValue > 0.3 ? 'moderate' : 'weak';
  }

  getCorrelationStatusText(city: string, param1: string, param2: string): string {
    const value = this.correlation?.[city]?.correlation_matrix?.[param1]?.[param2];
    if (value === undefined) return 'Faible';
    const absValue = Math.abs(value);
    return absValue > 0.7 ? 'Forte' : absValue > 0.3 ? 'Modérée' : 'Faible';
  }

  getDifferenceStatusClass(param: string, cityPair: string): string {
    const value = this.compare?.differences?.[param]?.[cityPair];
    if (value === undefined) return 'stable';
    return Math.abs(value) > 1.5 ? 'warning' : 'stable';
  }

  getDifferenceStatusText(param: string, cityPair: string): string {
    const value = this.compare?.differences?.[param]?.[cityPair];
    if (value === undefined) return 'Normale';
    return Math.abs(value) > 1.5 ? 'Anomalie détectée' : 'Normale';
  }

  getNotificationTitle(type: string): string {
    switch (type) {
      case 'success': return 'Succès';
      case 'warning': return 'Attention';
      case 'error': return 'Erreur';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'exclamation-triangle';
      case 'error': return 'x-circle';
      case 'info': return 'info-circle';
      default: return 'bell';
    }
  }

  visualisation(): void {
    this.router.navigate(['/chercheur/analyse/visualisation']);
  }
}