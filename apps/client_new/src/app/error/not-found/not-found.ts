import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 class="text-8xl font-bold text-gray-200">404</h1>
      <h2 class="mt-4 text-2xl font-semibold text-gray-700">ページが見つかりません</h2>
      <p class="mt-2 text-center text-gray-500">お探しのページは存在しないか、移動した可能性があります。</p>
      <a routerLink="/" class="mt-8 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
        トップページへ戻る
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
