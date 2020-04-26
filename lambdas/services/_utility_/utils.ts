import { Group } from './types'
import { parse } from 'url'

const norm = (x: string | undefined) => (x || '').toLowerCase().trim()
export const normLink = (s: string) => {
  const { host, pathname } = parse(s)
  return host === 'facebook.com' ? pathname?.replace(/\/$/, '') : s
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
const validURL = (str: string) => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  )
  return !!pattern.test(str)
}

export const isDateTimeString = (s: string) =>
  !!/\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{1,2}:\d{1,2}/i.test(s.trim())

export const isCorrectlyNamed = <T extends Pick<Group, 'link_facebook' | 'name' | 'location_name'>>(
  a: T
) =>
  validURL(a.link_facebook) &&
  !isDateTimeString(a.name) &&
  !isDateTimeString(a.location_name) &&
  !validURL(a.name) &&
  !validURL(a.location_name)

export const isSameGroup = <T extends Pick<Group, 'link_facebook' | 'name' | 'location_name'>>(
  a: T,
  b: T
) =>
  normLink(norm(a.link_facebook)) === normLink(norm(b.link_facebook)) ||
  (norm(a.name) === norm(b.name) && norm(a.location_name) === norm(b.location_name))

export const missingIn = <T extends any>(fn: (a: T, b: T) => boolean) => (a: T[], b: T[]) =>
  b.filter((x) => !a.some((y) => fn(x, y)))

export const uniqueBy = <T>(fn: (a: T, b: T) => boolean) => (arr: T[]) =>
  arr.reduce((a, b) => (a.some((x) => fn(b, x)) ? a : [...a, b]), [] as T[])

export const allSeq = <T>(x: (() => Promise<T>)[]) =>
  x.reduce((a, b) => a.then((all) => b().then((n) => [...all, n])), Promise.resolve([] as T[]))

export const omit = <T extends Record<any, any>, K extends (keyof T)[]>(
  keys: K,
  x: T
): Omit<T, K[number]> =>
  Object.keys(x).reduce<Omit<T, K[number]>>(
    (all, key) => (keys.includes(key) ? all : { ...all, [key]: x[key] }),
    {} as Omit<T, K[number]>
  )

export const renameKey = <O extends Record<any, any>, F extends keyof O, T extends string>(
  from: F,
  to: T
) => (x: O): Omit<O, F> & { [Key in T]: O[F] } => {
  let n = omit([from], x)
  return { ...n, [to]: x[to] } as any
}

export const comp2 = <A extends any, B extends any, C extends any>(
  fn1: (x: B) => C,
  fn2: (x: A) => B
) => (x: A) => fn1(fn2(x))
