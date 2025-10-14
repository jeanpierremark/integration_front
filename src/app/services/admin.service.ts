import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

   constructor(private http : HttpClient) { }

     httpOptions = {
    headers: new HttpHeaders({
      'authorization': `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json'

    })
  };

  get_info(){
     return this.http.get<any>('http://localhost:3001/users/api/user/info',{observe:'response',headers: this.httpOptions.headers})
  }

  get_all_user(){
     return this.http.get<any>('http://localhost:3001/users/api/user/all',{observe:'response',headers: this.httpOptions.headers})
  }
  
  get_activity(){
     return this.http.get<any>('http://localhost:3001/users/api/user/activity',{observe:'response',headers: this.httpOptions.headers})
  }

  get_latest_activity(){
     return this.http.get<any>('http://localhost:3001/users/api/user/latest_activity',{observe:'response',headers: this.httpOptions.headers})
  }
  
  get_all_log(){
     return this.http.get<any>('http://localhost:3001/users/api/user/all_log',{observe:'response',headers: this.httpOptions.headers})
  }

   get_latest_log(){
     return this.http.get<any>('http://localhost:3001/users/api/user/latest_log',{observe:'response',headers: this.httpOptions.headers})
  }

 get_log_history(periode:number){
     return this.http.get<any>('http://localhost:3001/users/api/user/log_history/'+periode,{observe:'response',headers: this.httpOptions.headers})
  }

  get_latest_users(){
   return this.http.get<any>('http://localhost:3001/users/api/user/latest_user',{observe:'response',headers:this.httpOptions.headers})
  }

  suspend_user(id:number,suspend:boolean){
      return this.http.post<any>('http://localhost:3001/users/api/user/suspend_user',{id,suspend},{observe:'response',headers:this.httpOptions.headers})
  }


  update_user(id:number,user:any){
    return this.http.put<any>('http://localhost:3001/users/api/user/update/'+id,{user},{ observe: 'response',headers:this.httpOptions.headers});
  }

   add_user(user:any){
    return this.http.post<any>('http://localhost:3001/users/api/user/add',{user},{ observe: 'response',headers:this.httpOptions.headers});
  }

  delete_user(id:number){
   return this.http.delete<any>('http://localhost:3001/users/api/user/delete/'+id,{ observe: 'response',headers:this.httpOptions.headers});
  }

  user_log(id:number){
   return this.http.get<any>('http://localhost:3001/users/api/user/log/'+id,{ observe: 'response',headers:this.httpOptions.headers});
  }

}
