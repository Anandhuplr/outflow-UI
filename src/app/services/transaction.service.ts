import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentServer } from '../../environments/environment';
import {
  Transaction
} from '../interfaces/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private readonly API = environmentServer.SERVER_URL + '/api/transactions';

  constructor(
    private http: HttpClient
  ) {}

  getTransactions(): Observable<Transaction[]> {

    return this.http.get<Transaction[]>(
      this.API,
      {
        withCredentials: true
      }
    );
  }

  createTransaction(
    transaction: Partial<Transaction>
  ): Observable<Transaction> {

    return this.http.post<Transaction>(
      this.API,
      transaction,
      {
        withCredentials: true
      }
    );
  }

  deleteTransaction(
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