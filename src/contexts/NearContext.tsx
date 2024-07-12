import { Wallet } from '@/src/near'
import { createContext, useContext } from 'react'

type NearContextValue = {
  wallet?: Wallet
  signedAccountId: string
}

export const NearContext = createContext<NearContextValue>({
  wallet: undefined,
  signedAccountId: ''
})

export const useNearWallet = () => useContext(NearContext)
