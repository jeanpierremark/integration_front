import { Component, OnInit } from '@angular/core';
import { interval, startWith, map } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  age : number;
  genre: string;
  dateCreation: string;
  derniereConnexion: string;
  avatar: string;
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
  role: string;
  statut: string;
  genre: string;
  age : number;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
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

  //Email error
  emailError = false
  emailVerif(email:string){

    if((email.endsWith("@gmail.com"))||(email.endsWith("@yahoo.com"))||(email.endsWith("@hotmail.com")) ||(email.endsWith("@hotmail.fr"))||(email.endsWith("@yahoo.fr"))){
      this.emailError = false
    }
    else{
      this.emailError = true
    }

  }

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
    role: 'etudiant',
    statut: 'actif',
    genre : '',
    age : 18
  };

  /*dtOptions : DataTables.Settings = {}
  dtTrigger :Subject<any> = new Subject<any>();*/

  constructor(private admin_service: AdminService, private user_service : UserService, private router:Router) {}

  ngOnInit(): void {
    /* this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      autoWidth: true,
    };*/
    this.get_all_users()
    this.setupIntervals()
    this.setupDateTimeObservable()
  }

  
  ngOnDestroy(): void {
  
    if(this.intervalId){
      clearInterval(this.intervalId)
    }
  }

  // Récupérer tous les utilisateurs
  get_all_users(): void {
    this.admin_service.get_all_user().subscribe({
      next: (response) => {
        if (response.body.message === 'success') {
          this.users = response.body.users.map((user: any) => ({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            age : user.age,
            genre:user.genre=='M'?'Homme':'Femme',
            statut: user.isActive ? 'Actif' : 'Suspendu',
            dateCreation: user.inscription,
            derniereConnexion: user.last_connexion == null ? 'Jamais connecté' : new Date(user.last_connexion).toISOString().slice(0, 16).replace('T', ' '),
            avatar: user.avatar || (user.prenom.charAt(0) + user.nom.charAt(0))
          }));
          this.filterUsers(); 
          //this.dtTrigger.next(null);

          console.log(this.users)
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
  getActiveUsers(): User[] {
    return this.users.filter(user => user.statut === 'actif');
  }

  getAdmins(): User[] {
    return this.users.filter(user => user.role === 'admin');
  }

  getSuspendedUsers(): User[] {
    return this.users.filter(user => user.statut === 'suspendu');
  }
  private setupIntervals(): void {
    this.intervalId = setInterval(() => {
      this.get_all_users()
    }, 600000);
  }
  // Filtrage des utilisateurs
  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.statut.toLowerCase().includes(this.searchTerm.toLowerCase())||
        user.role.toLowerCase().includes(this.searchTerm.toLowerCase()); 

      return matchesSearch;
    });
  }

  // Gestion des filtres
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Dans votre user.component.ts - Méthode openModal corrigée

openModal(type: 'add' | 'edit' | 'view', user: User | null = null): void {
  console.log('Opening modal:', type, user); // Debug
  
  this.modalType = type;
  this.selectedUser = user;
  this.showModal = true;

  if (user && type === 'edit') {
    this.formData = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      statut: user.statut,
      genre : user.genre,
      age : user.age
    };
    console.log('Form data for edit:', this.formData); // Debug
  } else if (user && type === 'view') {
    this.formData = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      statut: user.statut,
      genre : user.genre,
      age : user.age
    };
    console.log('Selected user for view:', this.selectedUser); // Debug
  } else if (type === 'add') {
    // Reset form for add
    this.formData = {
      nom: '',
      prenom: '',
      email: '',
      role: 'etudiant',
      statut: 'actif',
      genre :'',
      age : 18
    };
    console.log('Form reset for add'); // Debug
  }
}
closeModal():void{
  this.showModal=false
  this.selectedUser = null
}
// Méthode pour debugger les données
debugModalData(): void {
  console.log('Modal Debug Info:');
  console.log('showModal:', this.showModal);
  console.log('modalType:', this.modalType);
  console.log('selectedUser:', this.selectedUser);
  console.log('formData:', this.formData);
}

  // Soumission du formulaire
  handleSubmit(): void {
    if (this.modalType === 'add') {
      const user: User = {
        ...this.formData,
        id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
        dateCreation: new Date().toISOString().split('T')[0],
        derniereConnexion: 'Jamais connecté',
        avatar: this.formData.prenom.charAt(0) + this.formData.nom.charAt(0)
      };
     this.admin_service.add_user(user).subscribe({
        next: (response) => {
          if (response.body.message == 'success'){
          this.closeModal()
          this.showNotification('Utilisateur ajouté avec succès','success')
          this.get_all_users()
          }
        },
        error: (error) => {
          if (error.error.message == "Token expiré"){
            this.showNotification('Votre session est expiré','success')
            this.user_service.logout()
            this.router.navigate(["/connexion"])
        }
          console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
        }
      });
    } else if (this.modalType === 'edit' && this.selectedUser) {
      this.admin_service.update_user(this.selectedUser.id, this.formData).subscribe({
        next: (response) => {
         if (response.body.message == 'success'){
          this.closeModal()
          this.showNotification('Utilisateur modifié avec succès','success')
          this.get_all_users()
          }
        },
       error: (error) => {
          this.showNotification('Erreur lors de la modification','error')
          if (error.error.message == "Token expiré"){
          this.showNotification('Votre session est expiré','success')
          this.user_service.logout()
          this.router.navigate(["/connexion"])
        }
          console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        }
      });
    }
  }

  // Suppression d'un utilisateur
  deleteUser(id: number): void {
     Swal.fire({
          title: 'Vous allez supprimer cet utilisateur!',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        }).then((result) => {
          if (result.isConfirmed) {
            this.admin_service.delete_user(id).subscribe({
             next : (response) =>{
              if(response.body.message=='success'){
                this.showNotification('Utilisateur supprimé avec succès', 'success');
              }
              else{
                this.showNotification('Erreur lors de la suppression', 'error');
                this.get_all_users()

              }
             }, error : (error) =>{
              if (error.error.message == "Token expiré"){
                this.user_service.logout()
                this.router.navigate(["/connexion"])
              }
             }
            });
          }
        })
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
  // Formatage de date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Export des utilisateurs
  exportUsers(): void {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Nom,Prénom,Email,Rôle,Statut,Date Création,Dernière Connexion\n' +
      this.filteredUsers
        .map(
          user =>
            `${user.nom},${user.prenom},${user.email},${this.getRoleLabel(user.role)},${this.getStatutLabel(user.statut)},${user.dateCreation},${user.derniereConnexion}`
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
  }
}