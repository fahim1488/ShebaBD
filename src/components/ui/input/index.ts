// ─── Components ───────────────────────────────────────────────────────────────

export { TextInput } from './TextInput';
export type { TextInputProps } from './TextInput';

export { EmailInput } from './TextInput';
export type { EmailInputProps } from './TextInput';

export { NumberInput } from './TextInput';
export type { NumberInputProps } from './TextInput';

export { PasswordInput } from './PasswordInput';
export type { PasswordInputProps } from './PasswordInput';

export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

// ─── Shared Types ──────────────────────────────────────────────────────────────

export type { BaseInputProps, InputSize, InputState } from './input.types';

// ─── Variants (for advanced consumers who need raw CVA access) ─────────────────

export {
  inputElementVariants,
  inputWrapperVariants,
  inputLabelVariants,
  inputHelperVariants,
  inputIconSizes,
} from './input.variants';
