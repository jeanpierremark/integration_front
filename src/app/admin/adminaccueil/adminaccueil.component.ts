import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { interval, map, startWith } from 'rxjs';

Chart.register(...registerables);

interface Stats {
  activeUsers: number;
  usersChange: number;
  datasets: number;
  newDatasets: number;
  runningAnalyses: number;
  analysesChange: number;
  systemAlerts: number;
  criticalAlerts: number;
}

interface RegistrationStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface ConnectionStats {
  todayPeak: string;
  dailyAverage: string;
  averageTime: string;
}

interface Activity {
  initials: string;
  userName: string;
  action: string;
  timeAgo: string;
  avatarColor: string;
}

interface User {
  initials: string;
  name: string;
  email: string;
  isActive: boolean;
  avatarColor: string;
}

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  iconColor: string;
}

@Component({
  selector: 'app-adminaccueil',
  templateUrl: './adminaccueil.component.html',
  styleUrls: ['./adminaccueil.component.css']
})
export class AdminaccueilComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // ViewChild pour les canvas des graphiques
  @ViewChild('usersChart', { static: false }) usersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('datasetsChart', { static: false }) datasetsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('analysesChart', { static: false }) analysesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('alertsChart', { static: false }) alertsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('registrationsChart', { static: false }) registrationsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('connectionsChart', { static: false }) connectionsChartRef!: ElementRef<HTMLCanvasElement>;

  // Propriétés du composant
  searchTerm: string = '';
  notificationCount: number = 3;
  registrationsPeriod: string = '30';
  connectionsPeriod: string = '30';

  // Charts instances
  private charts: { [key: string]: Chart } = {};
  private refreshInterval: any;

  // Données
  stats: Stats = {
    activeUsers: 1247,
    usersChange: 12,
    datasets: 856,
    newDatasets: 24,
    runningAnalyses: 342,
    analysesChange: 8,
    systemAlerts: 12,
    criticalAlerts: 3
  };

  registrationStats: RegistrationStats = {
    today: 24,
    thisWeek: 186,
    thisMonth: 742
  };

  connectionStats: ConnectionStats = {
    todayPeak: '1,247',
    dailyAverage: '945',
    averageTime: '2h 34m'
  };

  recentActivities: Activity[] = [
    {
      initials: 'ML',
      userName: 'Marie Lambert',
      action: 'a téléchargé un nouveau dataset de températures océaniques',
      timeAgo: 'il y a 15 min',
      avatarColor: 'linear-gradient(45deg, #4f5af5, #526aff)'
    },
    {
      initials: 'PD',
      userName: 'Pierre Dubois',
      action: 'a terminé l\'analyse des données météorologiques',
      timeAgo: 'il y a 32 min',
      avatarColor: 'linear-gradient(45deg, #06c270, #00c266)'
    },
    {
      initials: 'SB',
      userName: 'Sophie Bernard',
      action: 'a créé un nouveau projet d\'analyse climatique',
      timeAgo: 'il y a 1h',
      avatarColor: 'linear-gradient(45deg, #7c3aed, #6d28d9)'
    },
    {
      initials: 'JM',
      userName: 'Jean Martin',
      action: 'a configuré une nouvelle alerte de seuil de CO2',
      timeAgo: 'il y a 2h',
      avatarColor: 'linear-gradient(45deg, #f59e0b, #d97706)'
    },
    {
      initials: 'AR',
      userName: 'Anne Robert',
      action: 'a exporté un rapport d\'analyse des précipitations',
      timeAgo: 'il y a 3h',
      avatarColor: 'linear-gradient(45deg, #8b5cf6, #7c3aed)'
    }
  ];

  recentUsers: User[] = [
    {
      initials: 'ML',
      name: 'Marie Lambert',
      email: 'marie.lambert@climate.org',
      isActive: true,
      avatarColor: 'linear-gradient(45deg, #4f5af5, #526aff)'
    },
    {
      initials: 'PD',
      name: 'Pierre Dubois',
      email: 'pierre.dubois@climate.org',
      isActive: true,
      avatarColor: 'linear-gradient(45deg, #06c270, #00c266)'
    },
    {
      initials: 'SB',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@climate.org',
      isActive: false,
      avatarColor: 'linear-gradient(45deg, #7c3aed, #6d28d9)'
    },
    {
      initials: 'JM',
      name: 'Jean Martin',
      email: 'jean.martin@climate.org',
      isActive: true,
      avatarColor: 'linear-gradient(45deg, #f59e0b, #d97706)'
    },
    {
      initials: 'AR',
      name: 'Anne Robert',
      email: 'anne.robert@climate.org',
      isActive: true,
      avatarColor: 'linear-gradient(45deg, #8b5cf6, #7c3aed)'
    }
  ];

  dateHeureActuelle$:any

  constructor() {}

  ngOnInit(): void {
    this.startDataRefresh();
    this.setupDateTimeObservable()
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    // Détruire tous les graphiques
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  private initializeCharts(): void {
    this.createSmallCharts();
    this.createLargeCharts();
  }

  private createSmallCharts(): void {
    const smallChartOptions: Partial<ChartConfiguration> = {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 },
          line: { tension: 0.4 }
        }
      }
    };

    const labels = ['', '', '', '', '', '', ''];

    // Graphique utilisateurs
    if (this.usersChartRef) {
      this.charts['users'] = new Chart(this.usersChartRef.nativeElement, {
        type: 'line' as ChartType,
        data: {
          labels: labels,
          datasets: [{
            data: [100, 120, 115, 140, 160, 155, 180],
            borderColor: '#4f5af5',
            backgroundColor: 'rgba(79, 90, 245, 0.1)',
            fill: true
          }]
        },
        options: smallChartOptions.options
      });
    }

    // Graphique datasets
    if (this.datasetsChartRef) {
      this.charts['datasets'] = new Chart(this.datasetsChartRef.nativeElement, {
        type: 'line' as ChartType,
        data: {
          labels: labels,
          datasets: [{
            data: [50, 55, 65, 60, 70, 75, 80],
            borderColor: '#06c270',
            backgroundColor: 'rgba(6, 194, 112, 0.1)',
            fill: true
          }]
        },
        options: smallChartOptions.options
      });
    }

    // Graphique analyses
    if (this.analysesChartRef) {
      this.charts['analyses'] = new Chart(this.analysesChartRef.nativeElement, {
        type: 'line' as ChartType,
        data: {
          labels: labels,
          datasets: [{
            data: [30, 35, 32, 40, 38, 42, 45],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            fill: true
          }]
        },
        options: smallChartOptions.options
      });
    }

    // Graphique alertes
    if (this.alertsChartRef) {
      this.charts['alerts'] = new Chart(this.alertsChartRef.nativeElement, {
        type: 'line' as ChartType,
        data: {
          labels: labels,
          datasets: [{
            data: [5, 8, 12, 7, 10, 15, 12],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true
          }]
        },
        options: smallChartOptions.options
      });
    }
  }

  private createLargeCharts(): void {
    const largeChartOptions: Partial<ChartConfiguration> = {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: '#6b7280'
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
              color: '#6b7280'
            }
          }
        },
        elements: {
          point: { 
            radius: 4,
            hoverRadius: 6
          },
          line: { tension: 0.4 }
        }
      }
    };

    // Graphique des inscriptions
    this.updateRegistrationsChart();
    
    // Graphique des connexions
    this.updateConnectionsChart();
  }

  updateRegistrationsChart(): void {
    const period = parseInt(this.registrationsPeriod);
    const data = this.generateRegistrationData(period);
    
    if (this.charts['registrations']) {
      this.charts['registrations'].destroy();
    }

    if (this.registrationsChartRef) {
      this.charts['registrations'] = new Chart(this.registrationsChartRef.nativeElement, {
        type: 'line' as ChartType,
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Inscriptions',
            data: data.values,
            borderColor: '#4f5af5',
            backgroundColor: 'rgba(79, 90, 245, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              display: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { color: '#6b7280' }
            },
            y: {
              display: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { color: '#6b7280' }
            }
          }
        }
      });
    }
  }

  updateConnectionsChart(): void {
    const period = parseInt(this.connectionsPeriod);
    const data = this.generateConnectionData(period);
    
    if (this.charts['connections']) {
      this.charts['connections'].destroy();
    }

    if (this.connectionsChartRef) {
      this.charts['connections'] = new Chart(this.connectionsChartRef.nativeElement, {
        type: 'bar' as ChartType,
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Connexions',
            data: data.values,
            backgroundColor: 'rgba(6, 194, 112, 0.7)',
            borderColor: '#06c270',
            borderWidth: 2,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              display: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { color: '#6b7280' }
            },
            y: {
              display: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { color: '#6b7280' }
            }
          }
        }
      });
    }
  }

  private generateRegistrationData(days: number): { labels: string[], values: number[] } {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }));
      values.push(Math.floor(Math.random() * 50) + 10);
    }
    
    return { labels, values };
  }

  private generateConnectionData(days: number): { labels: string[], values: number[] } {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }));
      values.push(Math.floor(Math.random() * 1500) + 500);
    }
    
    return { labels, values };
  }

  private startDataRefresh(): void {
    // Simulation de mise à jour des données toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 30000);
  }

  private refreshStats(): void {
    // Simulation de nouvelles données
    this.stats = {
      ...this.stats,
      activeUsers: this.stats.activeUsers + Math.floor(Math.random() * 10) - 5,
      systemAlerts: Math.max(0, this.stats.systemAlerts + Math.floor(Math.random() * 3) - 1)
    };

    this.notificationCount = this.stats.systemAlerts > 0 ? this.stats.criticalAlerts : 0;
  }

  // Méthodes d'interaction
  showNotifications(): void {
    console.log('Afficher les notifications');
    // Implémentation de l'affichage des notifications
  }

  showUserMenu(): void {
    console.log('Afficher le menu utilisateur');
    // Implémentation du menu utilisateur
  }

  viewAllActivities(): void {
    console.log('Voir toutes les activités');
    // Navigation vers la page des activités
  }

  viewAllUsers(): void {
    console.log('Voir tous les utilisateurs');
    // Navigation vers la page de gestion des utilisateurs
  }

  executeAction(actionId: string): void {
    console.log(`Exécuter l'action: ${actionId}`);
    
    switch (actionId) {
      case 'manage-users':
        this.navigateToUserManagement();
        break;
      case 'usage-reports':
        this.showUsageReports();
        break;
      case 'data-management':
        this.navigateToDataManagement();
        break;
      case 'system-config':
        this.showSystemConfig();
        break;
      case 'alerts-monitoring':
        this.showAlertsMonitoring();
        break;
      case 'advanced-analytics':
        this.showAdvancedAnalytics();
        break;
      default:
        console.warn(`Action inconnue: ${actionId}`);
    }
  }

  private navigateToUserManagement(): void {
    // Navigation vers la gestion des utilisateurs
    console.log('Navigation vers la gestion des utilisateurs');
  }

  private showUsageReports(): void {
    // Affichage des rapports d'usage
    console.log('Affichage des rapports d\'usage');
  }

  private navigateToDataManagement(): void {
    // Navigation vers la gestion des données
    console.log('Navigation vers la gestion des données');
  }

  private showSystemConfig(): void {
    // Affichage de la configuration système
    console.log('Affichage de la configuration système');
  }

  private showAlertsMonitoring(): void {
    // Affichage des alertes et monitoring
    console.log('Affichage des alertes et monitoring');
  }

  private showAdvancedAnalytics(): void {
    // Affichage des analytics avancés
    console.log('Affichage des analytics avancés');
  }
}