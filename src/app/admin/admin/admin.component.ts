// admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  avatar: string;
  lastLogin: string;
  registrationDate: string;
  weatherDataUsage: number; // MB
  apiCalls: number;
  subscription: 'free' | 'premium' | 'enterprise';
  location: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  suspendedUsers: number;
  totalApiCalls: number;
  premiumUsers: number;
  dataUsage: number; // GB
  serverStatus: 'online' | 'maintenance' | 'offline';
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  type: 'login' | 'api_call' | 'data_export' | 'subscription' | 'error';
  details: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  
  // État du dashboard
  selectedView: 'overview' | 'users' | 'activity' | 'settings' = 'overview';
  searchTerm: string = '';
  selectedRole: string = 'all';
  selectedStatus: string = 'all';
  
  // Statistiques du dashboard
  stats: DashboardStats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    suspendedUsers: 12,
    totalApiCalls: 45780,
    premiumUsers: 156,
    dataUsage: 125.6,
    serverStatus: 'online'
  };

  // Liste des utilisateurs
  users: User[] = [
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      role: 'admin',
      status: 'active',
      avatar: 'MD',
      lastLogin: '2025-01-26 09:30',
      registrationDate: '2024-03-15',
      weatherDataUsage: 45.2,
      apiCalls: 1250,
      subscription: 'enterprise',
      location: 'Paris, France'
    },
    {
      id: 2,
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      role: 'user',
      status: 'active',
      avatar: 'JM',
      lastLogin: '2025-01-26 08:45',
      registrationDate: '2024-05-20',
      weatherDataUsage: 12.8,
      apiCalls: 340,
      subscription: 'premium',
      location: 'Lyon, France'
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      role: 'moderator',
      status: 'active',
      avatar: 'SW',
      lastLogin: '2025-01-25 16:20',
      registrationDate: '2024-01-10',
      weatherDataUsage: 28.5,
      apiCalls: 890,
      subscription: 'premium',
      location: 'London, UK'
    },
    {
      id: 4,
      name: 'Ahmed Ben Ali',
      email: 'ahmed.benali@email.com',
      role: 'user',
      status: 'suspended',
      avatar: 'AB',
      lastLogin: '2025-01-20 14:30',
      registrationDate: '2024-08-05',
      weatherDataUsage: 5.2,
      apiCalls: 150,
      subscription: 'free',
      location: 'Tunis, Tunisia'
    },
    {
      id: 5,
      name: 'Emma Johnson',
      email: 'emma.johnson@email.com',
      role: 'user',
      status: 'inactive',
      avatar: 'EJ',
      lastLogin: '2025-01-15 10:15',
      registrationDate: '2024-11-02',
      weatherDataUsage: 2.1,
      apiCalls: 45,
      subscription: 'free',
      location: 'New York, USA'
    }
  ];

  // Journal d'activité
  activityLogs: ActivityLog[] = [
    {
      id: 1,
      user: 'Marie Dupont',
      action: 'Connexion administrateur',
      timestamp: '2025-01-26 09:30:15',
      type: 'login',
      details: 'Connexion réussie depuis Paris'
    },
    {
      id: 2,
      user: 'Jean Martin',
      action: 'Export de données météo',
      timestamp: '2025-01-26 09:15:42',
      type: 'data_export',
      details: 'Export 15 jours - Format CSV'
    },
    {
      id: 3,
      user: 'Sarah Wilson',
      action: 'Appel API - Prévisions',
      timestamp: '2025-01-26 08:45:33',
      type: 'api_call',
      details: 'GET /api/forecast/london'
    },
    {
      id: 4,
      user: 'Ahmed Ben Ali',
      action: 'Suspension de compte',
      timestamp: '2025-01-25 15:20:10',
      type: 'subscription',
      details: 'Suspension pour dépassement de quota'
    },
    {
      id: 5,
      user: 'Système',
      action: 'Erreur serveur API',
      timestamp: '2025-01-25 14:30:25',
      type: 'error',
      details: 'Timeout - Service Visual Crossing'
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
    // Actualiser les statistiques toutes les minutes
    this.refreshInterval = setInterval(() => {
      this.updateStats();
    }, 60000);
  }

  private updateStats() {
    // Simuler la mise à jour des statistiques
    this.stats.activeUsers += Math.floor(Math.random() * 10 - 5);
    this.stats.totalApiCalls += Math.floor(Math.random() * 100);
    this.stats.dataUsage += Math.random() * 0.5;
  }

  // Navigation entre les vues
  setView(view: 'overview' | 'users' | 'activity' | 'settings') {
    this.selectedView = view;
  }

  // Filtrage des utilisateurs
  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  // Actions sur les utilisateurs
  activateUser(user: User) {
    user.status = 'active';
    this.addActivityLog(`Activation du compte de ${user.name}`, 'subscription');
  }

  suspendUser(user: User) {
    user.status = 'suspended';
    this.addActivityLog(`Suspension du compte de ${user.name}`, 'subscription');
  }

  deleteUser(user: User) {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.users.splice(index, 1);
      this.addActivityLog(`Suppression du compte de ${user.name}`, 'subscription');
      this.updateUserStats();
    }
  }

  resetPassword(user: User) {
    this.addActivityLog(`Réinitialisation du mot de passe de ${user.name}`, 'subscription');
  }

  changeUserRole(user: User, newRole: 'admin' | 'user' | 'moderator') {
    const oldRole = user.role;
    user.role = newRole;
    this.addActivityLog(`Changement de rôle de ${user.name}: ${oldRole} → ${newRole}`, 'subscription');
  }

  // Ajouter une entrée au journal d'activité
  private addActivityLog(action: string, type: ActivityLog['type']) {
    const newLog: ActivityLog = {
      id: this.activityLogs.length + 1,
      user: 'Admin',
      action: action,
      timestamp: new Date().toLocaleString('fr-FR'),
      type: type,
      details: 'Action effectuée par l\'administrateur'
    };
    this.activityLogs.unshift(newLog);
  }

  // Mettre à jour les statistiques après modifications
  private updateUserStats() {
    this.stats.totalUsers = this.users.length;
    this.stats.activeUsers = this.users.filter(u => u.status === 'active').length;
    this.stats.suspendedUsers = this.users.filter(u => u.status === 'suspended').length;
    this.stats.premiumUsers = this.users.filter(u => u.subscription === 'premium' || u.subscription === 'enterprise').length;
  }

  // Méthodes utilitaires
  getRoleClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'moderator': return 'bg-warning';
      case 'user': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'suspended': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getSubscriptionClass(subscription: string): string {
    switch (subscription) {
      case 'enterprise': return 'bg-dark';
      case 'premium': return 'bg-warning';
      case 'free': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getActivityTypeIcon(type: string): string {
    switch (type) {
      case 'login': return 'bi-box-arrow-in-right';
      case 'api_call': return 'bi-cloud-arrow-down';
      case 'data_export': return 'bi-download';
      case 'subscription': return 'bi-person-gear';
      case 'error': return 'bi-exclamation-triangle';
      default: return 'bi-info-circle';
    }
  }

  getActivityTypeClass(type: string): string {
    switch (type) {
      case 'login': return 'text-success';
      case 'api_call': return 'text-primary';
      case 'data_export': return 'text-info';
      case 'subscription': return 'text-warning';
      case 'error': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  // Export des données
  exportUsers() {
    const csvContent = this.generateCSV(this.filteredUsers);
    this.downloadCSV(csvContent, 'users-export.csv');
  }

  private generateCSV(users: User[]): string {
    const headers = ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Abonnement', 'Dernière connexion'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.subscription,
        user.lastLogin
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('fr-FR');
  }
}