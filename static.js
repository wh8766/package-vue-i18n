import v from '@/lang'

// 提供给国际化自动转的代码使用，在vue 里能够不再区分template 和script 里的$t
export const $t = function(key) {
  return v.t(key)
}

