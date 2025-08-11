import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

 constructor(private http : HttpClient) { }
  getDecodedAccessToken(token : string):any{
      try{
        return jwtDecode(token);
      }catch(e){
        return null;
      }
  }

    httpOptions = {
      headers: new HttpHeaders({
        'authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
  
      })
    };

  register(prenom:string,nom: string,email:string,password:string,role:string,genre:string,age:number,deletable:boolean){
    return this.http.post<any>('http://localhost:3001/users/register/api/user/register',{prenom,nom,email,password,role,age,genre,deletable},{ observe: 'response'});
  }
  
  login(email:string,password:string){
    return this.http.post<any>('http://localhost:3001/users/login/api/user/login',{email,password},{observe: 'response'})
    .pipe(
     map((userdata)=>{
      const token = userdata.body.token as string;
      const tokenInfo= this.getDecodedAccessToken(token);
      
      localStorage.setItem('token', token);
      console.log(userdata.body)
      localStorage.setItem('id', tokenInfo.userId);
      localStorage.setItem('email', userdata.body.user.email);
      localStorage.setItem('prenom', userdata.body.user.prenom);
      localStorage.setItem('nom',userdata.body.user.nom);
      localStorage.setItem('genre',userdata.body.user.genre);
      localStorage.setItem('age',userdata.body.user.age);
      localStorage.setItem('key', tokenInfo.key);
      localStorage.setItem('role', userdata.body.user.role);
      return userdata;
     })
    )
  }
  logout_sec(){
    return this.http.post<any>('http://localhost:3001/users/api/user/logout',null,{ observe: 'response',headers: this.httpOptions.headers});
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('key');
    localStorage.removeItem('email');
    localStorage.removeItem('prenom');
    localStorage.removeItem('nom');
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('genre');
    localStorage.removeItem('age');
  }

  

  
}
