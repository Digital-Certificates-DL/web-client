import { DropdownItem } from '@/types'

export enum STATE_FILTERS {
  ALL = 'All',
  NOTGENERATED = 'Not generated',
  GENERATED = 'Generated',
}

export enum COURSE_FILTERS {
  ALL = 'All',
  SOLIDITY = 'Solidity',
  GOLANG = 'Golang',
  DATABASE = 'Database',
  DEFI = 'Defi',
}

export enum DATA_FILTERS {
  ALL = 'All',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'Month',
}

export const DROP_DOWN_COURSE_LIST = [
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.ALL,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.SOLIDITY,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.GOLANG,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DATABASE,
  },
  {
    img: '/branding/solidity-ico.png',
    text: COURSE_FILTERS.DEFI,
  },
] as DropdownItem[]

export const DROP_DOWN_DATA_LIST = [
  {
    text: DATA_FILTERS.ALL,
  },
  {
    text: DATA_FILTERS.DAY,
  },
  {
    text: DATA_FILTERS.WEEK,
  },
  {
    text: DATA_FILTERS.MONTH,
  },
] as DropdownItem[]

export const DROP_DOWN_STATE_LIST = [
  {
    text: STATE_FILTERS.ALL,
  },
  {
    text: STATE_FILTERS.GENERATED,
  },
  {
    text: STATE_FILTERS.NOTGENERATED,
  },
] as DropdownItem[]
