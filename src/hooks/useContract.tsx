import { BurnContract, TokenContract } from '@/config'
import { useNearWallet } from '@/contexts/NearContext'
import { formatUnits, parseUnits } from '@/utils/number'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useState } from 'react'

export const useContract = () => {
  const { signedAccountId, wallet } = useNearWallet()

  const [isBuying, setIsBuying] = useState(false)
  const [isBurning, setIsBurning] = useState(false)
  const [isUseSession, setIsUseSession] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  const [session, setSession] = useState(0)
  const [token, setToken] = useState({ balance: 0, decimals: 18, symbol: '', formatted: '0' })

  const balance = useCallback(async () => {
    try {
      setIsLoadingBalance(true)

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
      setIsLoadingBalance(false)
    }
  }, [signedAccountId, wallet])

  const burn = async (amount = '1') => {
    try {
      setIsBurning(true)

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
      setIsBurning(false)
    }
  }

  const take = async (amount = '1', cb?: (err?: unknown) => void) => {
    try {
      setIsUseSession(true)

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
      setIsUseSession(false)
    }
  }

  const buy = async (amount = '1') => {
    try {
      setIsBuying(true)

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const tokenAmount = parseUnits(amount, token.decimals)

      await wallet.callMethod({
        contractId: TokenContract,
        method: 'buy',
        args: { amount: tokenAmount },
        deposit: '1'
      })
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setIsBuying(false)
    }
  }

  return {
    isBuying,
    isBurning,
    isUseSession,
    isLoadingBalance,

    balance,
    burn,
    take,
    buy,

    token,
    session
  }
}
