import Decimal from 'decimal.js'

export const parseUnits = (amount: string | number, decimals = 18) => {
  return Decimal.mul(amount, Decimal.pow(10, decimals)).toString()
}

export const formatUnits = (amount: string | number, decimals = 18) => {
  return Decimal.div(amount, Decimal.pow(10, decimals)).toFixed()
}
