import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ArticleCardComponent } from '$components/article-card';
import { Article } from '$domains/article-list';

@Component({
  selector: 'app-article-list-content',
  standalone: true,
  imports: [ArticleCardComponent],
  templateUrl: './article-list-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListContentComponent {
  readonly articles = input.required<Article[]>();
}
