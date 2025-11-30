import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ArticlePageResponse, ArticlePagesResponse } from './article-page.response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArticlePageApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getPages(articleId: string): Observable<ArticlePagesResponse> {
    return this.http.get<ArticlePagesResponse>(`${this.baseUrl}/article/${articleId}/page`);
  }

  getPage(articleId: string, pageId: string): Observable<ArticlePageResponse> {
    return this.http.get<ArticlePageResponse>(`${this.baseUrl}/article/${articleId}/page/${pageId}`);
  }
}
