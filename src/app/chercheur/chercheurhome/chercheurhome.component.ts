import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chercheurhome',
  templateUrl: './chercheurhome.component.html',
  styleUrls: ['./chercheurhome.component.css']
})
export class ChercheurhomeComponent {

}
