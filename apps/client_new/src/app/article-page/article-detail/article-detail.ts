import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { ArticlePageFacade } from '$domains/article-page';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-gray-600">読み込み中...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facade = inject(ArticlePageFacade);

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.facade.loadPages(articleId);

      // ページ一覧が読み込まれたら最初のページにリダイレクト
      this.facade.pages$
        .pipe(
          filter((pages) => pages.length > 0),
          take(1),
        )
        .subscribe((pages) => {
          const firstPage = pages.reduce((min, page) => (page.order < min.order ? page : min), pages[0]);
          this.router.navigate(['/article', articleId, firstPage.id]);
        });
    }
  }
}
