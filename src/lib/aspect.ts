/** 比例 → Tailwind aspect class（SmartImage 與 CMS 共用，避免重複） */
export const RATIO_CLASS: Record<string, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
};

/** 焦點 → Tailwind object-position class（SmartImage 與 CMS 共用） */
export const POS_CLASS: Record<string, string> = {
  'top-left': 'object-left-top',
  top: 'object-top',
  'top-right': 'object-right-top',
  left: 'object-left',
  center: 'object-center',
  right: 'object-right',
  'bottom-left': 'object-left-bottom',
  bottom: 'object-bottom',
  'bottom-right': 'object-right-bottom',
};
