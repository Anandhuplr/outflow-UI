import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentServer } from '../../environments/environment';
import {
  Category
} from '../interfaces/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly API = environmentServer.SERVER_URL +
    '/api/categories';

  constructor(
    private http: HttpClient
  ) {}

  getCategories(): Observable<Category[]> {

    return this.http.get<Category[]>(
      this.API,
      {
        withCredentials: true
      }
    );
  }

  createCategory(
    data: {
      name: string;
      icon?: string;
      color?: string;
    }
  ): Observable<Category> {

    return this.http.post<Category>(
      this.API,
      data,
      {
        withCredentials: true
      }
    );
  }

  deleteCategory(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API}/${id}`,
      {
        withCredentials: true
      }
    );
  }
}