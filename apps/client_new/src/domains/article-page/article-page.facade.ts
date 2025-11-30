import { isPlatformServer } from '@angular/common';
import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { Store } from '@ngxs/store';
import { from, switchMap } from 'rxjs';

import { ArticlePageApi } from './api';
import { ArticlePage, ArticlePageItem, TocItem } from './model';
import { ArticlePageState, SetArticlePage, SetArticlePageItems, SetToc } from './store';

// TransferStateのキーを生成する関数
const makePageContentKey = (articleId: string, pageId: string) =>
  makeStateKey<string>(`article-page-content-${articleId}-${pageId}`);

const makeTocKey = (articleId: string, pageId: string) =>
  makeStateKey<TocItem[]>(`article-page-toc-${articleId}-${pageId}`);

@Injectable()
export class ArticlePageFacade {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private readonly store = inject(Store);
  private readonly api = inject(ArticlePageApi);

  readonly pages$ = this.store.select(ArticlePageState.getArticlePageItems);
  readonly currentPage$ = this.store.select(ArticlePageState.getArticlePage);
  readonly toc$ = this.store.select(ArticlePageState.getToc);

  loadPages(articleId: string): void {
    this.api.getPages(articleId).subscribe((response) => {
      const pages: ArticlePageItem[] = response.pages.map((r) => ({
        id: r.id,
        title: r.title,
        level: r.level,
        order: r.order,
      }));
      this.store.dispatch(new SetArticlePageItems(pages));
    });
  }

  loadPage(articleId: string, pageId: string): void {
    const contentKey = makePageContentKey(articleId, pageId);
    const tocKey = makeTocKey(articleId, pageId);

    this.api
      .getPage(articleId, pageId)
      .pipe(
        switchMap((response) => {
          // クライアントサイド: TransferStateから変換済みHTML/TOCを取得
          const cachedContent = this.transferState.get(contentKey, null);
          const cachedToc = this.transferState.get(tocKey, null);
          if (cachedContent && cachedToc) {
            this.transferState.remove(contentKey);
            this.transferState.remove(tocKey);
            const page: ArticlePage = {
              id: response.id,
              createdAt: new Date(response.createdAt),
              updatedAt: new Date(response.updatedAt),
              title: response.title,
              description: response.description,
              content: cachedContent,
              level: response.level,
              order: response.order,
              tags: response.tags,
            };
            return this.store.dispatch([new SetArticlePage(page), new SetToc(cachedToc)]);
          }

          // サーバーサイド: HTML変換とTOC抽出を実行してTransferStateに保存
          if (isPlatformServer(this.platformId)) {
            return from(this.convertMarkdownAndExtractToc(response.content)).pipe(
              switchMap(({ html, toc }) => {
                this.transferState.set(contentKey, html);
                this.transferState.set(tocKey, toc);
                const page: ArticlePage = {
                  id: response.id,
                  createdAt: new Date(response.createdAt),
                  updatedAt: new Date(response.updatedAt),
                  title: response.title,
                  description: response.description,
                  content: html,
                  level: response.level,
                  order: response.order,
                  tags: response.tags,
                };
                return this.store.dispatch([new SetArticlePage(page), new SetToc(toc)]);
              }),
            );
          }

          // クライアントサイドでキャッシュがない場合（SPA遷移時）
          const page: ArticlePage = {
            id: response.id,
            createdAt: new Date(response.createdAt),
            updatedAt: new Date(response.updatedAt),
            title: response.title,
            description: response.description,
            content: response.content,
            level: response.level,
            order: response.order,
            tags: response.tags,
          };
          return this.store.dispatch([new SetArticlePage(page), new SetToc([])]);
        }),
      )
      .subscribe();
  }

  /**
   * サーバーサイドでのみ実行されるMarkdown→HTML変換とTOC抽出
   * 動的インポートにより、クライアントバンドルからhighlight.js等を除外
   */
  private async convertMarkdownAndExtractToc(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
    const { markdownToHtml, extractTableOfContents } = await import('@monorepo/markdown');
    const { highlightHtml } = await import('$shared/ui/highlighter');

    const htmlWithoutHighlight = markdownToHtml(markdown);
    const html = highlightHtml(htmlWithoutHighlight);
    const tocRaw = extractTableOfContents(markdown);

    // TocItem型に変換（パッケージのTocItemとローカルのTocItemが同じ構造）
    const toc: TocItem[] = tocRaw.map((item) => ({
      id: item.id,
      text: item.text,
      level: item.level,
    }));

    return { html, toc };
  }
}
