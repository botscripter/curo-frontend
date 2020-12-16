import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { CURO_BASE_PATH } from '../curo-base-path';
import { Task } from './task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  basePath: string;

  constructor(
    @Optional() @Inject(CURO_BASE_PATH) curoBasePath: string,
    private httpClient: HttpClient
  ) {
    this.basePath = curoBasePath || '';
  }

  /**
   * Get task by id.
   */
  getTask(
    id: string,
    params?: {
      variables?: string[];
      attributes?: string[];
      historic?: boolean;
    }
  ): Observable<Task> {
    return this.httpClient.get<Task>(`${this.basePath}/tasks/${id}`, {
      params: params as Params
    });
  }

  /**
   * Set the assignee of a task.
   */
  assignTask(id: string, assignee: string): Observable<void> {
    return this.httpClient.post<void>(`${this.basePath}/tasks/${id}/assignee`, {
      assignee
    });
  }

  /**
   * Completes a task.
   */
  completeTask(
    id: string,
    variables?: any,
    params?: { flowToNext?: boolean; returnVariables?: boolean }
  ): Observable<Task | void> {
    return this.httpClient.post<Task | void>(
      `${this.basePath}/tasks/${id}/status`,
      variables,
      { params: params as Params }
    );
  }
}
