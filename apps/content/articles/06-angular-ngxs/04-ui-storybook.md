---
title: shadcn/ui スタイル UI + Storybook
description: CVA + Angular CDKを使用したshadcn/uiスタイルのUIコンポーネント構成と、StorybookによるUIカタログの作成方法を解説します。
---

## shadcn/ui アプローチとは

**shadcn/ui** は、React 向けの UI コンポーネントライブラリですが、そのアプローチは Angular にも適用できます。

### 特徴

| 特徴           | 説明                                           |
| -------------- | ---------------------------------------------- |
| コピー可能     | npm パッケージではなく、コードをコピーして使用 |
| カスタマイズ性 | 自由に変更可能                                 |
| Tailwind CSS   | ユーティリティクラスでスタイリング             |
| CVA            | バリアント管理を型安全に                       |

このテンプレートでは、Angular 向けに shadcn/ui のアプローチを採用しています。

## Primitives vs Composed

UI コンポーネントを 2 層に分けて管理します。

| 種類           | 配置先        | 責務                       | パッケージ化 |
| -------------- | ------------- | -------------------------- | ------------ |
| **Primitives** | `shared/ui/`  | スタイリングのみ、状態なし | 可能         |
| **Composed**   | `components/` | ロジック連携、状態あり     | このリポジトリ固有 |

### Primitives（shared/ui/）

最小単位の UI コンポーネント。外部パッケージ化も可能です。

- `ButtonDirective` - ボタンスタイル
- `InputDirective` - 入力フィールドスタイル

### Composed（components/）

Primitives を組み合わせ、ロジックを含むコンポーネント。

- `InputFieldComponent` - Reactive Forms 連携、エラー表示

## CVA（Class Variance Authority）

**CVA** は、バリアント（variant）を型安全に管理するライブラリです。

### インストール

```bash
pnpm add class-variance-authority
```

### Button コンポーネントの実装

```typescript
// shared/ui/button/button.ts
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ElementRef,
  effect,
  DestroyRef,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * Button variants definition (shadcn/ui pattern)
 */
export const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
   transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Button component (shadcn/ui style for Angular)
 */
@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly destroyRef = inject(DestroyRef);

  /** Button variant */
  readonly variant = input<ButtonVariants['variant']>('default');

  /** Button size */
  readonly size = input<ButtonVariants['size']>('default');

  /** Additional CSS classes */
  readonly class = input<string>('');

  /** Computed class combining variants and custom classes */
  readonly computedClass = computed(() =>
    cn(
      buttonVariants({
        variant: this.variant(),
        size: this.size(),
      }),
      this.class(),
    ),
  );

  constructor() {
    // Setup focus monitoring for a11y
    effect(() => {
      this.focusMonitor.monitor(this.elementRef, true);
    });

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.focusMonitor.stopMonitoring(this.elementRef);
    });
  }
}
```

### 使用例

```html
<button appButton>Default</button>
<button appButton variant="destructive">Delete</button>
<button appButton variant="outline" size="sm">Small</button>
<button appButton variant="ghost" size="icon">
  <svg>...</svg>
</button>
```

## cn() ユーティリティ

**cn()** は、Tailwind CSS クラスを安全にマージするユーティリティです。

```typescript
// shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS クラスを安全にマージするユーティリティ
 * shadcn/ui と同じパターン（clsx + tailwind-merge）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### なぜ cn() が必要か

```typescript
// 通常の文字列結合では競合が発生
'px-4 px-8'  // 両方適用される問題

// cn() を使うと後勝ち
cn('px-4', 'px-8')  // => 'px-8'

// 条件付きクラスも簡潔に
cn('base-class', condition && 'conditional-class')
```

## Angular CDK によるアクセシビリティ

**@angular/cdk/a11y** を使用して、アクセシビリティを向上させます。

### FocusMonitor

キーボードフォーカスとマウスフォーカスを区別します。

```typescript
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({...})
export class ButtonDirective {
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      // フォーカスの監視を開始
      this.focusMonitor.monitor(this.elementRef, true);
    });

    this.destroyRef.onDestroy(() => {
      // クリーンアップ
      this.focusMonitor.stopMonitoring(this.elementRef);
    });
  }
}
```

## Composed コンポーネント

Primitives を組み合わせて、ロジックを含むコンポーネントを作成します。

### InputFieldComponent

```typescript
// components/input-field/input-field.ts
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { filter, merge, switchMap } from 'rxjs';

/** Default error messages for common validators */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: '入力は必須です',
  minlength: '文字数が足りません',
  maxlength: '文字数が多すぎます',
  email: 'メールアドレス形式で入力してください',
  pattern: '入力形式が正しくありません',
};

/**
 * InputFieldComponent - Composed component for form input with label and validation
 */
@Component({
  selector: 'app-input-field',
  standalone: true,
  template: `
    @if (label()) {
      <label [for]="id()" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ label() }}
      </label>
    }

    <ng-content></ng-content>

    @if (showError()) {
      <div class="mt-2 text-sm text-destructive">
        @for (message of activeErrorMessages(); track message) {
          <p>{{ message }}</p>
        }
      </div>
    }
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent {
  private readonly destroyRef = inject(DestroyRef);

  /** Label text for the input */
  readonly label = input<string>();

  /** HTML id attribute for the input */
  readonly id = input<string>();

  /** Form control to monitor for validation state */
  readonly control = input<AbstractControl>();

  /** Custom error messages (merged with defaults) */
  readonly messages = input<Record<string, string>>({});

  /** Internal signal to track control state changes (for Zoneless compatibility) */
  private readonly controlState = signal(0);

  /** Whether to show error state */
  readonly showError = computed(() => {
    this.controlState();
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  });

  /** Active error messages based on current validation errors */
  readonly activeErrorMessages = computed(() => {
    this.controlState();
    const ctrl = this.control();
    if (!ctrl?.errors) return [];

    const msgs = { ...DEFAULT_ERROR_MESSAGES, ...this.messages() };
    return Object.keys(ctrl.errors).map((key) => {
      if (key === 'minlength') {
        const error = ctrl.errors?.['minlength'];
        return `${error.requiredLength}文字以上で入力してください`;
      }
      if (key === 'maxlength') {
        const error = ctrl.errors?.['maxlength'];
        return `${error.requiredLength}文字以内で入力してください`;
      }
      return msgs[key] ?? `${key} エラー`;
    });
  });

  constructor() {
    // Subscribe to control changes to update signal (Zoneless compatibility)
    toObservable(this.control)
      .pipe(
        filter((ctrl): ctrl is AbstractControl => ctrl !== undefined),
        switchMap((ctrl) => merge(ctrl.statusChanges, ctrl.events)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.controlState.update((v) => v + 1);
      });
  }
}
```

### 使用例

```html
<app-input-field
  label="ユーザー名"
  [control]="form.controls.username"
  [messages]="{ required: '必須項目です' }"
>
  <input appInput formControlName="username" />
</app-input-field>
```

## Storybook

**Storybook** を使用して、UI コンポーネントのカタログを作成します。

### 起動

```bash
pnpm --filter @monorepo/client storybook  # http://localhost:6006
```

### Stories の作成

```typescript
// shared/ui/button/button.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonDirective, buttonVariants } from './button';

const meta: Meta<ButtonDirective> = {
  title: 'UI/Button',
  component: ButtonDirective,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<button appButton [variant]="variant" [size]="size">Button</button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonDirective>;

export const Default: Story = {
  args: { variant: 'default', size: 'default' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};
```

### 対象コンポーネント

| カテゴリ   | パス                      | 内容                |
| ---------- | ------------------------- | ------------------- |
| UI         | `shared/ui/button/`       | ButtonDirective     |
| UI         | `shared/ui/input/`        | InputDirective      |
| Components | `components/input-field/` | InputFieldComponent |

### Storybook の利点

| 利点           | 説明                                   |
| -------------- | -------------------------------------- |
| 独立開発       | コンポーネントを単体でテスト可能       |
| ドキュメント   | 自動生成されるドキュメント             |
| ビジュアルテスト| UI の変更を視覚的に確認               |
| チーム共有     | デザイナーとの連携がスムーズ           |

## まとめ

shadcn/ui スタイルの UI 構成により、以下を実現できます。

1. **CVA によるバリアント管理** - 型安全で柔軟なスタイリング
2. **Primitives と Composed の分離** - 再利用性と保守性の向上
3. **Angular CDK との統合** - アクセシビリティの向上
4. **Storybook によるカタログ** - UI コンポーネントのドキュメント化

次のページでは、RxAngular と SSR/ISR について解説します。


