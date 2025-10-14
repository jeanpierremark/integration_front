import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { interval, map, startWith } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { UserService } from 'src/app/services/user.service';

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
  name: string;
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
  role?: string;
  age?: number;
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
  @ViewChild('logHistoryChart', { static: false }) logHistoryChartRef!: ElementRef<HTMLCanvasElement>;
  // ViewChild pour les diagrammes circulaires
  @ViewChild('genderChart', { static: false }) genderChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('roleChart', { static: false }) roleChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private admin_service: AdminService, private router: Router, private user_service:UserService) {}

  // Propriétés du composant
  searchTerm: string = '';
  notificationCount: number = 3;
  registrationsPeriod: string = '30';
  connectionsPeriod: string = '30';

  // Stats
  activedusers: any = 0;
  connectedusers: any = 0;
  blockedusers: any = 0;
  analyses: any = 0;
  chercheurs: any = 0;
  etudiants: any = 0;
  hommes: any = 0;
  femmes: any = 0;

  // Interval
  intervalId: any;

  // Loading
  loading: boolean = false;

  // Periode
  selectedPeriod: any = 30;

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

  recentActivities: Activity[] = [];
  recentUsers: User[] = [];

  dateHeureActuelle$: any;

  // Periods
  periods = [
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
    { value: 90, label: '90 jours' },
  ];

  ngOnInit(): void {
    this.setupDateTimeObservable();
    this.setupIntervals();
    this.getInfo();
    this.get_log_history(this.selectedPeriod);
    this.get_latest_users();
    this.get_latest_activities();
  }

  getInfo() {
    this.admin_service.get_info().subscribe({
      next: (response) => {
        if (response.body.message == 'success') {
          console.log(response.body);
          this.activedusers = response.body.active_users;
          this.connectedusers = response.body.connected_users;
          this.blockedusers = response.body.blocked_users;
          this.analyses = response.body.analyses;
          this.chercheurs = response.body.chercheurs;
          this.etudiants = response.body.etudiants;
          this.hommes = response.body.hommes;
          this.femmes = response.body.femmes;
          // Mettre à jour les graphiques après réception des données
          setTimeout(() => {
            this.updatePieCharts();
          }, 100);
        }
      },error : (error) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    });
  }

  private setupIntervals(): void {
    this.intervalId = setInterval(() => {
      this.getInfo();
    }, 10 * 60 * 1000); // 10 minutes
  }

  log_history: any = {};

  get_log_history(periode: number) {
    this.loading = true;
    this.admin_service.get_log_history(periode).subscribe({
      next: (response) => {
        if (response.body.message == 'success') {
          this.log_history = response.body.log_history;
          console.log('log_history', this.log_history);
          setTimeout(() => {
            if (this.charts['logHistory']) {
              this.updateLogHistoryChart();
            } else {
              this.createLogHistoryChart();
            }
          }, 100);
          this.loading = false;
        }
      },error : (error) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    });
  }

  onPeriodChange(period: number): void {
    this.selectedPeriod = period;
    this.get_log_history(this.selectedPeriod);
  }

  latest_users: any = {};

  get_latest_users() {
    this.admin_service.get_latest_users().subscribe({
      next: (response) => {
        if (response.body.message == 'success') {
          this.latest_users = response.body.users;
          console.log('latest_users : ', this.latest_users);
          this.transformLatestUsersToRecentUsers();
        }
      },error : (error) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    });
  }

  latest_activities: any = {};

  get_latest_activities() {
    this.admin_service.get_latest_activity().subscribe({
      next: (response) => {
        if (response.body.message == 'success') {
          this.latest_activities = response.body.latest_activities;
          console.log('latest_activities : ', this.latest_activities);
          this.transformLatestActivitiesToRecentActivities();
        }
      },error : (error) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
      }
    });
  }

  private transformLatestUsersToRecentUsers(): void {
    if (!this.latest_users || !Array.isArray(this.latest_users)) {
      return;
    }

    this.recentUsers = this.latest_users.map((user: any) => {
      const initials = this.generateInitials(user.prenom, user.nom);
      const avatarColor = this.generateAvatarColor(user.id);
      return {
        initials: initials,
        name: `${user.prenom} ${user.nom}`.trim(),
        email: user.email,
        isActive: user.isActive,
        avatarColor: avatarColor,
        role: user.role,
        age: user.age
      };
    });
    console.log('recentUsers transformé:', this.recentUsers);
  }

  private transformLatestActivitiesToRecentActivities(): void {
    if (!this.latest_activities || !Array.isArray(this.latest_activities)) {
      return;
    }

    this.recentActivities = this.latest_activities.map((user: any) => {
      const initials = this.generateInitials(user.prenom, user.nom);
      const avatarColor = this.generateAvatarColor(user.id);
      return {
        initials: initials,
        name: `${user.prenom} ${user.nom}`.trim(),
        action: user.action,
        timeAgo: new Date(user.date_action).toISOString().slice(0, 16).replace('T', ' '),
        avatarColor: avatarColor
      };
    });
    console.log('recentActivities transformé:', this.recentActivities);
  }

  private generateInitials(prenom: string, nom: string): string {
    const prenomInitial = prenom ? prenom.trim().charAt(0).toUpperCase() : '';
    const nomInitial = nom ? nom.trim().charAt(0).toUpperCase() : '';
    return `${prenomInitial}${nomInitial}`;
  }

  private generateAvatarColor(id: number): string {
    const colors = [
      'linear-gradient(45deg, #4f5af5, #526aff)',
      'linear-gradient(45deg, #06c270, #00c266)',
      'linear-gradient(45deg, #7c3aed, #6d28d9)',
      'linear-gradient(45deg, #f59e0b, #d97706)',
      'linear-gradient(45deg, #8b5cf6, #7c3aed)',
      'linear-gradient(45deg, #ef4444, #dc2626)',
      'linear-gradient(45deg, #10b981, #059669)',
      'linear-gradient(45deg, #f97316, #ea580c)',
      'linear-gradient(45deg, #3b82f6, #2563eb)',
      'linear-gradient(45deg, #ec4899, #db2777)'
    ];
    return colors[id % colors.length];
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
      if (this.log_history && this.log_history.length > 0) {
        this.createLogHistoryChart();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  private initializeCharts(): void {
    this.createSmallCharts();
    this.createPieCharts();
  }

  private createSmallCharts(): void {
    const smallChartOptions: Partial<ChartConfiguration> = {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 8
          }
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
        type: 'bar' as ChartType,
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
        type: 'bar' as ChartType,
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
        type: 'bar' as ChartType,
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
        type: 'bar' as ChartType,
        data: {
          labels: labels,
          datasets: [{
            data: [5, 8, 12, 7, 10, 15, 12],
            borderColor: '#f42828',
            backgroundColor: '#f4282823',
            fill: true
          }]
        },
        options: smallChartOptions.options
      });
    }
  }

  private createPieCharts(): void {
    // Graphique répartition hommes/femmes
    if (this.genderChartRef) {
      this.charts['gender'] = new Chart(this.genderChartRef.nativeElement, {
        type: 'pie' as ChartType,
        data: {
          labels: ['Hommes', 'Femmes'],
          datasets: [{
            data: [this.hommes, this.femmes],
            backgroundColor: ['#4f5af5', '#ec4899'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: { size: 14 },
                color: '#1f2937'
              }
            },
            tooltip: {
              titleFont: { size: 16 },
              bodyFont: { size: 14 },
              callbacks: {
                label: (context) => {
                  const total = this.hommes + this.femmes;
                  const value = context.raw as number;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Graphique répartition chercheurs/étudiants
    if (this.roleChartRef) {
      this.charts['role'] = new Chart(this.roleChartRef.nativeElement, {
        type: 'pie' as ChartType,
        data: {
          labels: ['Chercheurs', 'Étudiants'],
          datasets: [{
            data: [this.chercheurs, this.etudiants],
            backgroundColor: ['#06c270', '#f59e0b'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: { size: 14 },
                color: '#1f2937'
              }
            },
            tooltip: {
              titleFont: { size: 16 },
              bodyFont: { size: 14 },
              callbacks: {
                label: (context) => {
                  const total = this.chercheurs + this.etudiants;
                  const value = context.raw as number;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  private updatePieCharts(): void {
    // Mettre à jour le graphique hommes/femmes
    if (this.charts['gender']) {
      this.charts['gender'].data.datasets[0].data = [this.hommes, this.femmes];
      this.charts['gender'].update();
    }

    // Mettre à jour le graphique chercheurs/étudiants
    if (this.charts['role']) {
      this.charts['role'].data.datasets[0].data = [this.chercheurs, this.etudiants];
      this.charts['role'].update();
    }
  }

  private createLogHistoryChart(): void {
    if (!this.logHistoryChartRef || !this.log_history || this.log_history.length === 0) {
      return;
    }

    if (this.charts['logHistory']) {
      this.charts['logHistory'].destroy();
    }

    const labels = this.log_history.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    });

    const data = this.log_history.map((item: any) => item.nombre);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Connexions quotidiennes',
          data: data,
          borderColor: '#4f5af5',
          backgroundColor: 'rgba(79, 90, 245, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4f5af5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 14, weight: '500' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#4f5af5',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                const date = new Date(this.log_history[index].date);
                return date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                });
              },
              label: (context) => {
                return `Activité: ${context.parsed.y} connexions`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { font: { size: 12 }, color: '#64748b' }
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              font: { size: 12 },
              color: '#64748b',
              stepSize: Math.max(1, Math.ceil(Math.max(...data) / 5))
            }
          }
        },
        interaction: { intersect: false, mode: 'index' },
        elements: { point: { hoverBorderWidth: 3 } },
        animation: { duration: 750, easing: 'easeInOutQuart' }
      }
    };

    this.charts['logHistory'] = new Chart(this.logHistoryChartRef.nativeElement, config);
  }

  private updateLogHistoryChart(): void {
    if (this.charts['logHistory'] && this.log_history && this.log_history.length > 0) {
      const labels = this.log_history.map((item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      });

      const data = this.log_history.map((item: any) => item.nombre);

      this.charts['logHistory'].data.labels = labels;
      this.charts['logHistory'].data.datasets[0].data = data;
      this.charts['logHistory'].update('active');
    }
  }

  showNotifications(): void {
    console.log('Afficher les notifications');
  }

  viewAllActivities() {
    this.router.navigate(['/admin/activite']);
  }

  viewAllUsers() {
    this.router.navigate(['/admin/user']);
  }
}