import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Increment } from './home.actions';

/** Form model for text input */
export interface TextFormModel {
  text: string;
}

/** NGXS form plugin metadata */
export interface TextFormState {
  model: TextFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

export interface HomeStateModel {
  count: number;
  textForm: TextFormState;
}

@State<HomeStateModel>({
  name: 'home',
  defaults: {
    count: 0,
    textForm: {
      model: { text: '' },
      dirty: false,
      status: '',
      errors: {},
    },
  },
})
@Injectable()
export class HomeState {
  @Selector()
  static getCount(state: HomeStateModel): number {
    return state.count;
  }

  @Selector()
  static getTextFormModel(state: HomeStateModel): TextFormModel {
    return state.textForm.model;
  }

  @Selector()
  static getTextFormStatus(state: HomeStateModel): string {
    return state.textForm.status;
  }

  @Selector()
  static getTextFormDirty(state: HomeStateModel): boolean {
    return state.textForm.dirty;
  }

  @Action(Increment)
  increment(ctx: StateContext<HomeStateModel>): void {
    const state = ctx.getState();
    ctx.patchState({
      count: state.count + 1,
    });
  }
}
