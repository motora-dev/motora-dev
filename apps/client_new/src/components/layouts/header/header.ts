import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="fixed top-0 z-[100] w-full bg-white shadow-sm">
      <div class="w-full px-4">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-4 lg:gap-8">
            <a routerLink="/" class="text-xl font-bold text-gray-900 no-underline hover:text-gray-700">
              もとら's dev
            </a>
            <nav class="flex items-center gap-6">
              <a routerLink="/" class="text-gray-600 font-medium no-underline hover:text-gray-900"> 記事一覧 </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
