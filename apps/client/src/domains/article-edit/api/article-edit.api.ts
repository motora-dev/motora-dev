import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '$shared/lib';
import {
  GetArticleResponse,
  GetPageResponse,
  GetPagesResponse,
  UpdateArticleRequest,
  UpdateArticleResponse,
  UpdatePageRequest,
  UpdatePageResponse,
} from './article-edit.response';

@Injectable({ providedIn: 'root' })
export class ArticleEditApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL);

  getArticle(articleId: string): Observable<GetArticleResponse> {
    return this.http.get<GetArticleResponse>(`${this.baseUrl}/article/edit/${articleId}`);
  }

  updateArticle(articleId: string, request: UpdateArticleRequest): Observable<UpdateArticleResponse> {
    return this.http.put<UpdateArticleResponse>(`${this.baseUrl}/article/update/${articleId}`, request);
  }

  getPages(articleId: string): Observable<GetPagesResponse> {
    return this.http.get<GetPagesResponse>(`${this.baseUrl}/article/edit/${articleId}/page`);
  }

  getPage(articleId: string, pageId: string): Observable<GetPageResponse> {
    return this.http.get<GetPageResponse>(`${this.baseUrl}/article/edit/${articleId}/page/${pageId}`);
  }

  updatePage(articleId: string, pageId: string, request: UpdatePageRequest): Observable<UpdatePageResponse> {
    return this.http.put<UpdatePageResponse>(`${this.baseUrl}/article/edit/${articleId}/page/${pageId}`, request);
  }
}
