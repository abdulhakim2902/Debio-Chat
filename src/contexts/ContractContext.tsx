import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useNearWallet } from './NearContext'
import { BurnContract, TokenContract } from '@/src/config'
import { formatUnits, parseUnits } from '@/src/utils/number'
import { enqueueSnackbar } from 'notistack'
import { parseNearAmount } from 'near-api-js/lib/utils/format'

type ContractContextValue = {
  loading: {
    buy: boolean
    burn: boolean
    session: boolean
    balance: boolean
  }
  session: number
  token: Token
  balance: () => void
  buy: (amount?: string) => void
  burn: (amount?: string) => void
  take: (amount?: string, cb?: (err: unknown) => void) => void
}

export type Token = {
  balance: number
  decimals: number
  symbol: string
  formatted: string
}

export const ContractContext = createContext<ContractContextValue>({
  loading: {
    buy: false,
    burn: false,
    session: false,
    balance: false
  },
  session: 0,
  token: { balance: 0, decimals: 18, symbol: '', formatted: '0' },

  balance: () => {},
  buy: () => {},
  burn: () => {},
  take: () => {}
})

type ContractProviderProps = {
  children: ReactNode
}

export const ContractProvider: FC<ContractProviderProps> = ({ children }) => {
  const { signedAccountId, wallet } = useNearWallet()

  const [loading, setLoading] = useState({
    buy: false,
    burn: false,
    session: false,
    balance: false
  })

  const [session, setSession] = useState(0)
  const [token, setToken] = useState({ balance: 0, decimals: 18, symbol: '', formatted: '0' })

  const balance = useCallback(async () => {
    try {
      console.log('balance')
      setLoading(prev => ({ ...prev, balance: true }))

      if (!signedAccountId || !wallet) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const [tokenBalance, tokenMetadata, { session }] = await Promise.all([
        wallet.viewMethod({
          contractId: TokenContract,
          method: 'ft_balance_of',
          args: { account_id: signedAccountId }
        }),
        wallet.viewMethod({ contractId: TokenContract, method: 'ft_metadata' }),
        wallet.viewMethod({
          contractId: BurnContract,
          method: 'get_account_session',
          args: {
            token_id: TokenContract,
            account_id: signedAccountId
          }
        })
      ])

      console.log(tokenBalance)

      setSession(session)
      setToken({
        balance: tokenBalance,
        decimals: tokenMetadata.decimals,
        symbol: tokenMetadata.symbol,
        formatted: (+formatUnits(tokenBalance, tokenMetadata.decimals)).toLocaleString('en-Us')
      })
    } catch (err: any) {
      enqueueSnackbar(err.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, balance: false }))
    }
  }, [signedAccountId, wallet])

  const burn = async (amount = '1') => {
    try {
      setLoading(prev => ({ ...prev, burn: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      if (isNaN(Number(amount))) {
        throw 'INVALID_AMOUNT'
      }

      const tokenAmount = parseUnits(amount, token.decimals)

      if (Number(token.balance) < Number(tokenAmount)) {
        throw 'INSUFFICIENT_BALANCE'
      }

      await wallet.callMethod({
        contractId: BurnContract,
        method: 'burn',
        args: { token_id: TokenContract, amount: tokenAmount.toString() },
        deposit: '1'
      })
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, burn: false }))
    }
  }

  const take = async (amount = '1', cb?: (err?: unknown) => void) => {
    try {
      setLoading(prev => ({ ...prev, session: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      if (Number(session) < Number(amount)) {
        throw 'INSUFFICIENT_SESSION'
      }

      const account = await wallet.callMethod({
        contractId: BurnContract,
        method: 'use_session',
        args: { token_id: TokenContract, amount: amount.toString() }
      })

      setSession(account.session)

      cb && cb()
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
      cb && cb(err)
    } finally {
      setLoading(prev => ({ ...prev, session: false }))
    }
  }

  const buy = async (amount = '1') => {
    try {
      setLoading(prev => ({ ...prev, buy: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const tokenAmount = parseUnits(amount, token.decimals)

      await wallet.callMethod({
        contractId: TokenContract,
        method: 'buy',
        args: { amount: tokenAmount },
        deposit: String(parseNearAmount('0.00125'))
      })
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, buy: false }))
    }
  }

  return (
    <ContractContext.Provider value={{ loading, session, token, balance, buy, take, burn }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => useContext(ContractContext)
