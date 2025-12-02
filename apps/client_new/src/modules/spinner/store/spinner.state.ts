import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { HideSpinner, ShowSpinner } from './spinner.actions';

export interface SpinnerStateModel {
  loadingCount: number;
}

@State<SpinnerStateModel>({
  name: 'spinner',
  defaults: {
    loadingCount: 0,
  },
})
@Injectable()
export class SpinnerState {
  @Selector()
  static isLoading(state: SpinnerStateModel): boolean {
    return state.loadingCount > 0;
  }

  @Action(ShowSpinner)
  showSpinner(ctx: StateContext<SpinnerStateModel>) {
    ctx.patchState({ loadingCount: ctx.getState().loadingCount + 1 });
  }

  @Action(HideSpinner)
  hideSpinner(ctx: StateContext<SpinnerStateModel>) {
    const count = ctx.getState().loadingCount;
    ctx.patchState({ loadingCount: Math.max(0, count - 1) });
  }
}

