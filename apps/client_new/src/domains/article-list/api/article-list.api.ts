import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ArticleListResponse } from './article-list.response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArticleListApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getArticleList(): Observable<ArticleListResponse> {
    return this.http.get<ArticleListResponse>(`${this.baseUrl}/article-list`);
  }
}
