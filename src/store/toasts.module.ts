import store from '@/store'
import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from 'vuex-module-decorators'

export interface IToastsState {
  toasted: boolean
  message: string
  error: boolean
  needsTranslation: boolean
}

export interface IToastOptions {
  message: string
  error?: boolean
  needsTranslation?: boolean
}

@Module({ dynamic: true, store, name: 'toasts' })
class ToastsModule extends VuexModule implements IToastsState {
  toasted = false
  message = ''
  error = false
  needsTranslation = false

  @Mutation
  SET_TOAST(options: IToastOptions) {
    this.toasted = true
    this.message = options.message
    this.error = options.error ?? false
    this.needsTranslation = options.needsTranslation ?? false
  }

  @Mutation
  UNSET_TOAST() {
    this.toasted = false
  }

  @Action
  Toast(options: IToastOptions) {
    this.SET_TOAST({
      message: options.message,
      error: options.error ?? false,
      needsTranslation: options.needsTranslation ?? false
    })
  }

  @Action
  UnToast() {
    this.UNSET_TOAST()
  }
}

export default getModule(ToastsModule)
