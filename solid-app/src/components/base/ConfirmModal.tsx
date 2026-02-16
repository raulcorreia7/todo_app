import { Show, createSignal } from 'solid-js'
import { AlertTriangle, X, ArrowLeft, Check } from 'lucide-solid'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmStyle?: 'default' | 'danger'
}

let resolvePromise: ((value: boolean) => void) | null = null
const [modalState, setModalState] = createSignal<ConfirmOptions | null>(null)

export function showConfirmModal(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    resolvePromise = resolve
    setModalState(options)
  })
}

function handleConfirm() {
  setModalState(null)
  resolvePromise?.(true)
  resolvePromise = null
}

function handleCancel() {
  setModalState(null)
  resolvePromise?.(false)
  resolvePromise = null
}

export default function ConfirmModal() {
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <Show when={modalState()}>
      {(state) => (
        <div
          class="confirm-modal-backdrop"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div class="confirm-modal" classList={{ 'confirm-modal--danger': state().confirmStyle === 'danger' }}>
            <div class="confirm-modal__header">
              <div class="confirm-modal__title-row">
                <Show when={state().confirmStyle === 'danger'}>
                  <AlertTriangle size={20} class="confirm-modal__icon" />
                </Show>
                <h3 id="confirm-modal-title" class="confirm-modal__title">
                  {state().title || 'Confirm Action'}
                </h3>
              </div>
              <button class="confirm-modal__close" onClick={handleCancel} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <div class="confirm-modal__body">
              <p>{state().message}</p>
            </div>
            <div class="confirm-modal__footer">
              <button class="confirm-modal__btn confirm-modal__btn--cancel" onClick={handleCancel}>
                <ArrowLeft size={16} />
                {state().cancelText || 'Cancel'}
              </button>
              <button
                classList={{
                  'confirm-modal__btn': true,
                  'confirm-modal__btn--confirm': state().confirmStyle !== 'danger',
                  'confirm-modal__btn--danger': state().confirmStyle === 'danger',
                }}
                onClick={handleConfirm}
              >
                <Check size={16} />
                {state().confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Show>
  )
}
