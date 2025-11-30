import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Increment } from './store/home.actions';
import { HomeState, type TextFormModel } from './store/home.state';

/**
 * Facade service for Home domain
 * Abstracts store access and provides a clean API for components
 */
@Injectable({
  providedIn: 'root',
})
export class HomeFacade {
  private readonly store = inject(Store);

  /** Observable of the current count */
  readonly count$: Observable<number> = this.store.select(HomeState.getCount);

  /** Observable of the text form model */
  readonly textFormModel$: Observable<TextFormModel> = this.store.select(HomeState.getTextFormModel);

  /** Observable of the text form status (VALID, INVALID, etc.) */
  readonly textFormStatus$: Observable<string> = this.store.select(HomeState.getTextFormStatus);

  /** Observable of the text form dirty state */
  readonly textFormDirty$: Observable<boolean> = this.store.select(HomeState.getTextFormDirty);

  /** Increment the counter */
  increment(): void {
    this.store.dispatch(new Increment());
  }
}
