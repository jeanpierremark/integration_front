import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { interval, map, startWith } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';

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
  role?: string; // Ajout du rôle
  age?: number;  // Ajout de l'âge
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
  // Nouveau ViewChild pour le graphique log_history
  @ViewChild('logHistoryChart', { static: false }) logHistoryChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private admin_service: AdminService, private router: Router){}
  
  // Propriétés du composant
  searchTerm: string = '';
  notificationCount: number = 3;
  registrationsPeriod: string = '30';
  connectionsPeriod: string = '30';

  //Stats
  activedusers : any = 0
  connectedusers : any = 0
  blockedusers : any = 0
  analyses : any = 0

  //interval 
  intervalId : any

  //loading
  loading:boolean = false
  //Periode
  selectedPeriod: any = 30

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

  // MODIFIÉ - recentUsers maintenant sera rempli dynamiquement
  recentUsers: User[] = [];

  dateHeureActuelle$:any
  
  //Periods
  periods = [
    { value: 7, label: '7 jours' },
    { value: 30, label: '30 jours' },
    { value: 90, label: '90 jours' },
  ];

  ngOnInit(): void {
    this.setupDateTimeObservable()
    this.setupIntervals()
    this.getInfo() 
    this.get_log_history(this.selectedPeriod)
    this.get_latest_users()
    this.get_latest_activities()
  }

  getInfo(){
    this.admin_service.get_info().subscribe({next:(response)=>{
      if (response.body.message == 'success'){
        console.log(response.body)
        this.activedusers = response.body.active_users
        this.connectedusers = response.body.connected_users
        this.blockedusers = response.body.blocked_users
        this.analyses = response.body.analyses
      }
    }})
  }

  // Get all currents parameters every 10 mins
  private setupIntervals(): void {
    this.intervalId = setInterval(() => {
      this.getInfo()
    }, 10000);
  }

  log_history:any = {}
  
  //Get log history - MODIFIÉE pour créer/mettre à jour le graphique
  get_log_history(periode:number){
    this.loading=true
    this.admin_service.get_log_history(periode).subscribe({next:(response)=>{
      if(response.body.message == "success"){
        this.log_history = response.body.log_history
        console.log("log_history",this.log_history)
        
        // Créer ou mettre à jour le graphique après avoir reçu les données
        setTimeout(() => {
          if (this.charts['logHistory']) {
            this.updateLogHistoryChart();
          } else {
            this.createLogHistoryChart();
          }
        }, 100);
      this.loading=false
      }
    }})
  }

  //Change period
  onPeriodChange(period: number): void {
    this.selectedPeriod = period;
    this.get_log_history(this.selectedPeriod)
  } 

  latest_users:any = {}
  
  // MODIFIÉE - Get latest users et transformer en recentUsers
  get_latest_users(){
    this.admin_service.get_latest_users().subscribe({next:(response)=>{
      if(response.body.message == 'success'){
        this.latest_users = response.body.users
        console.log('latest_users : ',this.latest_users)
        
        // Transformer latest_users en recentUsers
        this.transformLatestUsersToRecentUsers();
      }
    }})
  }

  latest_activities:any = {}
  // MODIFIÉE - Get latest users et transformer en recentUsers
  get_latest_activities(){
    this.admin_service.get_latest_activity().subscribe({next:(response)=>{
      if(response.body.message == 'success'){
        this.latest_activities = response.body.latest_activities
        console.log('latest_activities : ',this.latest_activities)
        
        // Transformer latest_activities en recentActivities
        this.transformLatestActivitiesToRecentActivities();
      }
    }})
  }


  // NOUVELLE FONCTION - Transformer les données latest_users vers recentUsers
  private transformLatestUsersToRecentUsers(): void {
    if (!this.latest_users || !Array.isArray(this.latest_users)) {
      return;
    }

    this.recentUsers = this.latest_users.map((user: any) => {
      // Générer les initiales à partir du prénom et nom
      const initials = this.generateInitials(user.prenom, user.nom);
      
      // Générer une couleur basée sur l'ID de l'utilisateur
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
      // Générer les initiales à partir du prénom et nom
      const initials = this.generateInitials(user.prenom, user.nom);
      
      // Générer une couleur basée sur l'ID de l'utilisateur
      const avatarColor = this.generateAvatarColor(user.id);
      
      return {
        initials: initials,
        name: `${user.prenom} ${user.nom}`.trim(),
        email: user.email,
        action: user.action,
        timeAgo :new Date(user.date_action).toISOString().slice(0, 16).replace('T', ' '),
        avatarColor: avatarColor,
        
      };
    });

    console.log('recentActivities transformé:', this.recentActivities);
  }

  //Générer les initiales
  private generateInitials(prenom: string, nom: string): string {
    const prenomInitial = prenom ? prenom.trim().charAt(0).toUpperCase() : '';
    const nomInitial = nom ? nom.trim().charAt(0).toUpperCase() : '';
    return `${prenomInitial}${nomInitial}`;
  }

  //Générer une couleur d'avatar basée sur l'ID
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
      // Créer le graphique log_history si les données sont déjà disponibles
      if (this.log_history && this.log_history.length > 0) {
        this.createLogHistoryChart();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if(this.intervalId){
      clearInterval(this.intervalId)
    }
    // Détruire tous les graphiques
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  private initializeCharts(): void {
    this.createSmallCharts();
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

  // NOUVELLE FONCTION - Créer le graphique log_history
  private createLogHistoryChart(): void {
    if (!this.logHistoryChartRef || !this.log_history || this.log_history.length === 0) {
      return;
    }

    // Détruire le graphique existant s'il y en a un
    if (this.charts['logHistory']) {
      this.charts['logHistory'].destroy();
    }

    // Préparer les données
    const labels = this.log_history.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    });

    const data = this.log_history.map((item: any) => item.nombre);

    // Configuration du graphique
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
              font: {
                size: 12,
                weight: '500'
              }
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
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#64748b'
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#64748b',
              stepSize: Math.max(1, Math.ceil(Math.max(...data) / 5))
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        }
      }
    };

    // Créer le graphique
    this.charts['logHistory'] = new Chart(this.logHistoryChartRef.nativeElement, config);
  }

  // NOUVELLE FONCTION - Mettre à jour le graphique log_history
  private updateLogHistoryChart(): void {
    if (this.charts['logHistory'] && this.log_history && this.log_history.length > 0) {
      const labels = this.log_history.map((item: any) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        });
      });

      const data = this.log_history.map((item: any) => item.nombre);

      this.charts['logHistory'].data.labels = labels;
      this.charts['logHistory'].data.datasets[0].data = data;
      
      // Simplement mettre à jour sans recalculer le stepSize
      this.charts['logHistory'].update('active');
    }
  }

  // Méthodes d'interaction
  showNotifications(): void {
    console.log('Afficher les notifications');
    // Implémentation de l'affichage des notifications
  }

  viewAllActivities(){
   this.router.navigate(["/admin/activite"])
  }

  viewAllUsers(){
    this.router.navigate(["/admin/user"])
  }
}