import { isPlatformServer } from '@angular/common';
import { inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { Store } from '@ngxs/store';
import { from, Observable, switchMap } from 'rxjs';

import { ArticlePageApi } from './api';
import { ArticlePageResponse } from './api/article-page.response';
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
      .pipe(switchMap((response) => this.processPageContent(response, articleId, pageId, contentKey, tocKey)))
      .subscribe();
  }

  /**
   * ページコンテンツを処理してStoreにディスパッチ
   * 1. クライアントサイド: TransferStateからキャッシュを取得
   * 2. サーバーサイド: HTML変換してTransferStateに保存
   * 3. クライアントサイド（キャッシュなし）: SPA遷移時にクライアントで変換
   */
  private processPageContent(
    response: ArticlePageResponse,
    articleId: string,
    pageId: string,
    contentKey: StateKey<string>,
    tocKey: StateKey<TocItem[]>,
  ): Observable<void> {
    // クライアントサイド: TransferStateから変換済みHTML/TOCを取得
    const cachedContent = this.transferState.get(contentKey, null);
    const cachedToc = this.transferState.get(tocKey, null);
    if (cachedContent && cachedToc) {
      this.transferState.remove(contentKey);
      this.transferState.remove(tocKey);
      return this.dispatchPage(response, cachedContent, cachedToc);
    }

    // サーバーサイド: HTML変換とTOC抽出を実行してTransferStateに保存
    if (isPlatformServer(this.platformId)) {
      return from(this.convertMarkdownAndExtractToc(response.content, articleId, pageId)).pipe(
        switchMap(({ html, toc }) => {
          this.transferState.set(contentKey, html);
          this.transferState.set(tocKey, toc);
          return this.dispatchPage(response, html, toc);
        }),
      );
    }

    // クライアントサイドでキャッシュがない場合（SPA遷移時）
    return from(this.convertMarkdownAndExtractToc(response.content, articleId, pageId)).pipe(
      switchMap(({ html, toc }) => this.dispatchPage(response, html, toc)),
    );
  }

  private dispatchPage(response: ArticlePageResponse, content: string, toc: TocItem[]): Observable<void> {
    const page = this.toArticlePage(response, content);
    return this.store.dispatch([new SetArticlePage(page), new SetToc(toc)]);
  }

  /**
   * Markdown→HTML変換とTOC抽出
   * 動的インポートにより、初期バンドルからhighlight.js等を除外
   * クライアントではAppFacadeによりアイドル時にプリロード済み
   */
  private async convertMarkdownAndExtractToc(
    markdown: string,
    articleId: string,
    pageId: string,
  ): Promise<{ html: string; toc: TocItem[] }> {
    const { markdownToHtml, extractTableOfContents } = await import('@monorepo/markdown');
    const { highlightHtml } = await import('$shared/ui/highlighter');

    const htmlWithoutHighlight = markdownToHtml(markdown, { articleId, pageId });
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

  private toArticlePage(response: ArticlePageResponse, content: string): ArticlePage {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      title: response.title,
      description: response.description,
      content,
      level: response.level,
      order: response.order,
      tags: response.tags,
    };
  }
}
