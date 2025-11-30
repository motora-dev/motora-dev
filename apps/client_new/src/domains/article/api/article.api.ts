import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GetPagesResponse, PageDto } from '../model';

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getPages(articleId: string): Observable<GetPagesResponse> {
    return this.http.get<GetPagesResponse>(`${this.baseUrl}/article/${articleId}/page`);
  }

  getPage(articleId: string, pageId: string): Observable<PageDto> {
    return this.http.get<PageDto>(`${this.baseUrl}/article/${articleId}/page/${pageId}`);
  }
}
