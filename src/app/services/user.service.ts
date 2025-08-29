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
        'authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
  
      })
    };

  register(prenom:string,nom: string,email:string,password:string,role:string,genre:string,age:number){
    return this.http.post<any>('http://localhost:3001/users/register/api/user/register',{prenom,nom,email,password,role,age,genre},{ observe: 'response'});
  }
  
  login(email:string,password:string){
    return this.http.post<any>('http://localhost:3001/users/login/api/user/login',{email,password},{observe: 'response'})
    .pipe(
     map((userdata)=>{
      const token = userdata.body.token as string;
      const tokenInfo= this.getDecodedAccessToken(token);
      
      sessionStorage.setItem('token', token);
      console.log(userdata.body)
      sessionStorage.setItem('id', userdata.body.user.id);
      sessionStorage.setItem('email', userdata.body.user.email);
      sessionStorage.setItem('prenom', userdata.body.user.prenom);
      sessionStorage.setItem('nom',userdata.body.user.nom);
      sessionStorage.setItem('genre',userdata.body.user.genre);
      sessionStorage.setItem('age',userdata.body.user.age);
      sessionStorage.setItem('key', tokenInfo.key);
      sessionStorage.setItem('role', userdata.body.user.role);
      return userdata;
     })
    )
  }
  
  logout_sec(){
    return this.http.post<any>('http://localhost:3001/users/api/user/logout',null,{ observe: 'response',headers: this.httpOptions.headers});
  }

  logout(){
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('key');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('prenom');
    sessionStorage.removeItem('nom');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('genre');
    sessionStorage.removeItem('age');
  }

  do_something(id:number,action:string,statut:boolean){
    return this.http.post<any>('http://localhost:3001/users/api/user/do_something',{id,action,statut},{observe: 'response',headers: this.httpOptions.headers})
  }

  
}
