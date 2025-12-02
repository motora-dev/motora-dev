import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';

import { ArticleListFacade } from '$domains/article-list';
import { ArticleListContentComponent } from './components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RxLet, TranslatePipe, ArticleListContentComponent],
  providers: [ArticleListFacade],
  templateUrl: './article-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  private readonly facade = inject(ArticleListFacade);

  readonly articleList$ = this.facade.articleList$;

  constructor() {
    this.facade.loadArticleList();
  }
}
