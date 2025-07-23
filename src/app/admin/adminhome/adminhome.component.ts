import { Component } from '@angular/core';

@Component({
  selector: 'app-adminhome',
  templateUrl: './adminhome.component.html',
  styleUrls: ['./adminhome.component.css']
})
export class AdminhomeComponent {
user :any = localStorage.getItem('prenom')+" "+localStorage.getItem('nom');
}
