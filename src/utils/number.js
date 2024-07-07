import Decimal from 'decimal.js'

export const parseUnits = (amount, decimals = 18) => {
  return Decimal.mul(amount, Decimal.pow(10, decimals)).toString()
}

export const formatUnits = (amount, decimals = 18) => {
  return Decimal.div(amount, Decimal.pow(10, decimals)).toFixed()
}
