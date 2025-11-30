import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ArticleListDto } from '../model';

@Injectable({ providedIn: 'root' })
export class ArticleListApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getArticleList(): Observable<ArticleListDto> {
    return this.http.get<ArticleListDto>(`${this.baseUrl}/article-list`);
  }
}
