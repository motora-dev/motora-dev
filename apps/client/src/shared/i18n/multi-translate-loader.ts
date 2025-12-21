import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { SupportedLanguage } from './supported-languages';
import { TRANSLATIONS } from './translations';

export class MultiTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    // サポートされている言語の場合は合成された翻訳を返す
    // それ以外は空オブジェクトを返す（フォールバック処理はTranslateServiceが行う）
    const translation = TRANSLATIONS[lang as SupportedLanguage];
    return of(translation || {});
  }
}
