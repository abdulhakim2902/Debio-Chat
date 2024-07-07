import '@/styles/globals.css'

import NextHead from 'next/head'

import { useEffect, useState } from 'react'
import { Wallet } from '@/near'
import { BurnContract, NetworkId } from '@/config'
import { NearContext } from '@/contexts/NearContext'
import { SnackbarProvider } from 'notistack'

const wallet = new Wallet({
  createAccessKeyFor: BurnContract,
  networkId: NetworkId,
  methods: ['use_session']
})

export default function MyApp({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState('')

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  return (
    <SnackbarProvider anchorOrigin={{ horizontal: 'right', vertical: 'top' }} preventDuplicate={true}>
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <NextHead>
          <title>DEBIO CHAT</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' key='viewport' />
          <meta property='og:image' content='/share.jpg' />
        </NextHead>
        <Component {...pageProps} />
      </NearContext.Provider>
    </SnackbarProvider>
  )
}
