import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Article } from '$domains/article-list';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <article
      class="bg-white rounded-xl shadow-md hover:shadow-xl p-5 md:p-6 relative transition-shadow duration-300 cursor-pointer"
    >
      <a [routerLink]="['/article', article().id]" class="absolute inset-0 z-10"></a>
      <div class="relative pointer-events-none">
        <h2 class="text-xl md:text-2xl font-bold mb-3 text-gray-900 truncate">
          {{ article().title || '(タイトルなし)' }}
        </h2>
        <div class="flex flex-wrap gap-2 mb-4">
          @for (tag of article().tags; track tag) {
            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {{ tag }}
            </span>
          }
        </div>
        <div class="flex justify-between items-center pt-4 border-t border-gray-200 text-sm">
          <time class="text-gray-600">{{ article().createdAt | date: 'yyyy/MM/dd' }}</time>
          <span class="text-blue-600 font-medium">続きを読む →</span>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
}
