<template>
  <input
    type="file"
    class="file-field"
    :class="fileFieldClasses"
    @input="selectFile"
  />
</template>

<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue'
import { LocationAsRelativeRaw } from 'vue-router'
import { ICON_NAMES } from '@/enums'

type COLORS =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'

type SCHEMES = 'filled' | 'flat' | 'default'

type SIZES = 'large' | 'medium' | 'small' | 'x-small' | 'default'

const attrs = useAttrs()
const slots = useSlots()

type MODIFICATIONS = 'border-circle' | 'border-rounded' | 'default'

const props = withDefaults(
  defineProps<{
    text?: string
    scheme?: SCHEMES
    modification?: MODIFICATIONS
    color?: COLORS
    size?: SIZES
    route?: LocationAsRelativeRaw
    href?: string
    iconLeft?: ICON_NAMES
    iconRight?: ICON_NAMES
  }>(),
  {
    text: '',
    scheme: 'filled',
    modification: 'border-rounded',
    color: 'primary',
    size: 'medium',
    route: undefined,
    href: '',
    iconLeft: undefined,
    iconRight: undefined,
  },
)

const fileFieldClasses = computed(() =>
  [
    'file-field',
    `file-field--${props.color}`,
    `file-field--${props.size}`,
    ...(isDisabled.value ? ['app-button--disabled'] : []),
    ...((props.iconLeft || props.iconRight) && !props.text && !slots.default
      ? ['app-button--icon-only']
      : []),
  ].join(' '),
)

const isDisabled = computed((): boolean =>
  ['', 'disabled', true].includes(attrs.disabled as string | boolean),
)

const emit = defineEmits<{
  (e: 'submitted', file: string): boolean
}>()

const selectFile = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    const file = files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      emit('submitted', reader.result as string)
    }
    reader.onerror = error => {
      console.error(error)
    }
  }
}
</script>

<style lang="scss" scoped>
//make better

.file-field::-webkit-file-upload-button {
  visibility: hidden;
}

.fire-field {
  --button-transition-duration: 0.2s;
  outline: 0;
  font-family: var(--app-font-family);
  margin: 0;

  user-select: none;
  overflow: hidden;

  width: min-content;
  grid: auto / auto-flow max-content;
  align-items: center;
  justify-content: center;
  transition: var(--button-transition-duration) ease-in;
  transition-property: background-color, color;
  text-decoration: none;
  border: var(--app-button-border);
  background-color: var(--app-button-bg);
  color: var(--app-button-text);

  &--filled {
    --app-button-filled-bg: var(--primary-main);
    --app-button-filled-bg-hover: var(--primary-dark);
    --app-button-filled-bg-active: var(--primary-dark);

    --app-button-filled-text: var(--text-primary-invert-main);
    --app-button-filled-text-hover: var(--text-primary-invert-main);

    --app-button-bg: var(--app-button-filled-bg);
    --app-button-bg-hover: var(--app-button-filled-bg-hover);
    --app-button-bg-active: var(--app-button-filled-bg-active);

    --app-button-text: var(--app-button-filled-text);
    --app-button-text-hover: var(--app-button-filled-text-hover);

    --app-button-border: 0;
    --app-button-border-hover: 0;
    --app-button-border-active: 0;
  }

  &--flat {
    --app-button-flat-text: var(--text-primary-main);
    --app-button-flat-text-hover: var(--text-primary-dark);

    --app-button-flat-border: #{toRem(2)} solid var(--text-primary-light);
    --app-button-flat-border-hover: var(--app-button-flat-border);
    --app-button-flat-border-active: var(--app-button-flat-border);

    --app-button-bg: transparent;
    --app-button-bg-hover: transparent;
    --app-button-bg-active: transparent;

    --app-button-text: var(--app-button-flat-text);
    --app-button-text-hover: var(--app-button-flat-text-hover);

    --app-button-border: var(--app-button-flat-border);
    --app-button-border-hover: var(--app-button-flat-border-hover);
    --app-button-border-active: var(--app-button-flat-border-active);
  }

  &--success {
    --app-button-flat-text: var(--success-main);
    --app-button-flat-text-hover: var(--success-dark);
    --app-button-flat-border: #{toRem(2)} solid var(--success-main);
    --app-button-flat-border-hover: #{toRem(2)} solid var(--success-dark);
    --app-button-flat-border-active: #{toRem(2)} solid var(--success-dark);

    --app-button-filled-bg: var(--success-main);
    --app-button-filled-bg-hover: var(--success-dark);
    --app-button-filled-bg-active: var(--success-dark);
  }

  &--error {
    --app-button-flat-text: var(--error-main);
    --app-button-flat-text-hover: var(--error-dark);
    --app-button-flat-border: #{toRem(2)} solid var(--error-main);
    --app-button-flat-border-hover: #{toRem(2)} solid var(--error-dark);
    --app-button-flat-border-active: #{toRem(2)} solid var(--error-dark);

    --app-button-filled-bg: var(--error-main);
    --app-button-filled-bg-hover: var(--error-dark);
    --app-button-filled-bg-active: var(--error-dark);
  }

  &--warning {
    --app-button-flat-text: var(--warning-main);
    --app-button-flat-text-hover: var(--warning-dark);
    --app-button-flat-border: #{toRem(2)} solid var(--warning-dark);
    --app-button-flat-border-hover: #{toRem(2)} solid var(--warning-dark);
    --app-button-flat-border-active: #{toRem(2)} solid var(--warning-dark);

    --app-button-filled-bg: var(--warning-main);
    --app-button-filled-bg-hover: var(--warning-dark);
    --app-button-filled-bg-active: var(--warning-dark);
  }

  &--info {
    --app-button-flat-text: var(--info-main);
    --app-button-flat-text-hover: var(--info-dark);
    --app-button-flat-border: #{toRem(2)} solid var(--info-main);
    --app-button-flat-border-hover: #{toRem(2)} solid var(--info-dark);
    --app-button-flat-border-active: #{toRem(2)} solid var(--info-dark);

    --app-button-filled-bg: var(--info-main);
    --app-button-filled-bg-hover: var(--info-dark);
    --app-button-filled-bg-active: var(--info-dark);
  }

  &--border-circle {
    border-radius: toRem(50);
  }

  &--border-rounded {
    border-radius: toRem(4);
  }

  &--large {
    padding: toRem(18) toRem(36);
    grid-gap: toRem(10);
    font-size: toRem(14);
    line-height: 1.45;
    font-weight: 500;

    &.app-button--icon-only {
      padding: toRem(18);
    }
  }

  &--medium {
    padding: toRem(12) toRem(24);
    font-size: toRem(12);
    line-height: 1.3;
    font-weight: 500;
    grid-gap: toRem(10);

    &.app-button--icon-only {
      padding: toRem(12);
    }
  }

  &--small {
    padding: toRem(8) toRem(16);
    font-size: toRem(12);
    line-height: 1.45;
    font-weight: 500;
    grid-gap: toRem(10);

    &.app-button--icon-only {
      padding: toRem(8);
    }
  }
}
</style>
