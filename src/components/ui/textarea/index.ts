// ─── Component ────────────────────────────────────────────────────────────────

export { Textarea } from './Textarea';

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  TextareaProps,
  TextareaSize,
  TextareaState,
  TextareaResize,
} from './textarea.types';

// ─── Variants (for advanced consumers who need raw CVA access) ────────────────

export {
  textareaElementVariants,
  textareaWrapperVariants,
  textareaLabelVariants,
  textareaHelperVariants,
  getCounterColorClass,
  resizeClassMap,
  sizeLineHeights,
  sizePaddingY,
} from './textarea.variants';
