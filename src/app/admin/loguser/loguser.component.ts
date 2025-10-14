import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, startWith, map } from 'rxjs';
import { Subject } from 'rxjs';

import { AdminService } from 'src/app/services/admin.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  action: string;
  statut: string;
  isActive:boolean;
  connected : boolean;
  date_action : string;
  avatar: string;
}

interface UserLog {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut:string;
  adresse_ip: string;
  browser: string;
  browser_version: string;
  date_connexion: string;
  device: string;
  is_bot: boolean;
  is_mobile: boolean;
  is_pc: boolean;
  is_tablet: boolean;
  resultat: string;
  role: string;
}

interface Role {
  value: string;
  label: string;
  color: string;
}

interface Statut {
  value: string;
  label: string;
  color: string;
}

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  statut: string;
}

@Component({
  selector: 'app-loguser',
  templateUrl: './loguser.component.html',
  styleUrls: ['./loguser.component.css']
})
export class LoguserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  filterRole: string = 'tous';
  filterStatut: string = 'tous';
  showModal: boolean = false;
  modalType: 'add' | 'edit' | 'view' = 'add';
  selectedUser: User | null = null;
  showFilters: boolean = false;

  //Date et heure 
  dateHeureActuelle$ : any

  //Intervale
  intervalId : any

  // Définition des rôles
  roles: Role[] = [
    { value: 'admin', label: 'Administrateur', color: 'red' },
    { value: 'etudiant', label: 'Étudiant', color: 'blue' },
    { value: 'enseignant', label: 'Enseignant', color: 'green' }
  ];

  // Définition des statuts
  statuts: Statut[] = [
    { value: 'actif', label: 'Actif', color: 'green' },
    { value: 'suspendu', label: 'Suspendu', color: 'yellow' },
    { value: 'inactif', label: 'Inactif', color: 'gray' }
  ];

  formData: FormData = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'etudiant',
    statut: 'actif'
  };

  /*dtOptions : DataTables.Settings = {}
  dtTrigger :Subject<any> = new Subject<any>();*/

  constructor(private admin_service: AdminService, private user_service : UserService, private router : Router ) {}

  ngOnInit(): void {
   /* this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      autoWidth: true,
    };*/
    this.get_all_activity()
    this.setupIntervals()
    this.setupDateTimeObservable()
  }

  
  ngOnDestroy(): void {
  
    if(this.intervalId){
      clearInterval(this.intervalId)
    }
  }

  //Suspend user 
  suspend_user(id:number,suspend=true){
    this.admin_service.suspend_user(id,suspend=true).subscribe({
      next :(response)=>{
        if(response.body.message=='success'){
          console.log()
          this.showNotification('Utilisateur suspendu','success')
          
        }
      },error: (error: HttpErrorResponse) => {
        if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
          this.showNotification(error.error.message, 'error');}
    })
  }
  //Reactive user
  active_user(id:number,suspend=false){
    this.admin_service.suspend_user(id,suspend).subscribe({
      next :(response)=>{
        if(response.body.message=='success'){
          console.log(response.body.message)
          this.showNotification('Utilisateur réactivé','success')
          
        }
      },error: (error: HttpErrorResponse) => {
         if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
          this.showNotification(error.error.message, 'error');}
    })
  }
  // Récupérer tous les utilisateurs
  get_all_activity(): void {
    this.admin_service.get_activity().subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.users = response.body.activity_list.map((user: any) => ({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            action: user.action,
            statut: user.statut ? 'Succès' : 'Erreur',
            isActive:user.isActive,
            date_action:new Date(user.date_action).toISOString().slice(0, 16).replace('T', ' '),
            avatar: user.avatar || (user.prenom.charAt(0) + user.nom.charAt(0))
          }));
          this.filterUsers(); 
         // this.dtTrigger.next(null);

        }
      },
      error: (error) => {
        if (error.error.message == "Token expiré"){
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    });
  }

 user_log: UserLog = {
  id: 0,
  nom: '',
  prenom: '',
  email: '',
  statut: '',
  adresse_ip: '',
  browser: '',
  browser_version: '',
  date_connexion: '',
  device: '',
  is_bot: false,
  is_mobile: false,
  is_pc: false,
  is_tablet: false,
  resultat: '',
  role: ''
};

get_user_log(id: number) {
  this.admin_service.user_log(id).subscribe({
    next: (response) => {
      if (response.body.message === 'success') {
        const data = response.body.user_log;
        this.user_log.id = data.id || 0;
        this.user_log.nom = data.nom || '';
        this.user_log.prenom = data.prenom || '';
        this.user_log.email = data.email || '';
        this.user_log.statut = data.isActive ? 'Actif' : 'Suspendu';
        this.user_log.adresse_ip = data.adresse_ip || '';
        this.user_log.browser = data.browser || '';
        this.user_log.browser_version = data.browser_version || '';
        this.user_log.date_connexion = data.date_connexion || '';
        this.user_log.device = data.device == "Other" ? "PC":data.device;
        this.user_log.is_bot = data.is_bot || false;
        this.user_log.is_mobile = data.is_mobile || false;
        this.user_log.is_pc = data.is_pc || false;
        this.user_log.is_tablet = data.is_tablet || false;
        this.user_log.resultat = data.resultat || '';
        this.user_log.role = data.role || '';
      }
    },
    error: (error) => {
      console.error('Error fetching user log:', error);
    }
  });
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

  // Méthodes pour les statistiques

  private setupIntervals(): void {
    this.intervalId = setInterval(() => {
      this.get_all_activity()
    }, 10000);
  }
  // Filtrage des utilisateurs
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.statut.toLowerCase().includes(this.searchTerm.toLowerCase()); 

      return matchesSearch ;
    });
  }

  // Gestion des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Gestion des modales
  openModal(type:'view', user: User): void {
    this.modalType = type;
    this.showModal = true;
    this.get_user_log(user.id);
    this.selectedUser = user
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
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
      });
      
    }

  // Soumission du formulaire
   /*handleSubmit(): void {
    if (this.modalType === 'add') {
      const newUser: User = {
        ...this.formData,
        id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
        dateCreation: new Date().toISOString().split('T')[0],
        derniereConnexion: 'Jamais connecté',
        avatar: this.formData.prenom.charAt(0) + this.formData.nom.charAt(0)
      };
     this.admin_service.add_user(newUser).subscribe({
        next: () => {
          this.get_all_users(); // Rafraîchir la liste après ajout
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
        }
      });
    } else if (this.modalType === 'edit' && this.selectedUser) {
      this.admin_service.update_user(this.selectedUser.id, this.formData).subscribe({
        next: () => {
          this.get_all_users(); // Rafraîchir la liste après modification
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        }
      });
    }
  }

  // Suppression d'un utilisateur
  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.admin_service.delete_user(userId).subscribe({
        next: () => {
          this.get_all_users(); // Rafraîchir la liste après suppression
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        }
      });
    }
  }

  // Formatage de date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Export des utilisateurs
  exportUsers(): void {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Nom,Prénom,Email,Téléphone,Rôle,Statut,Date Création,Dernière Connexion\n' +
      this.filteredUsers
        .map(
          user =>
            `${user.nom},${user.prenom},${user.email},${user.telephone},${this.getRoleLabel(user.role)},${this.getStatutLabel(user.statut)},${user.dateCreation},${user.derniereConnexion}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'utilisateurs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Méthodes pour gérer les rôles et statuts
  getRoleLabel(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }

  getStatutLabel(statutValue: string): string {
    const statut = this.statuts.find(s => s.value === statutValue);
    return statut ? statut.label : statutValue;
  }

  getRoleClass(roleValue: string): string {
    const role = this.roles.find(r => r.value === roleValue);
    return role ? `badge-${role.color}` : 'badge-gray';
  }

  getStatutClass(statutValue: string): string {
    const statut = this.statuts.find(s => s.value === statutValue);
    return statut ? `badge-${statut.color}` : 'badge-gray';
  } */
}
