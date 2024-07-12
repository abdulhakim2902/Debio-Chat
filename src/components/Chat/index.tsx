import { useContract } from '@/src/contexts/ContractContext'
import { FC, useEffect } from 'react'
import { MobileChat } from './mobile'
import { WebChat } from './web'
import { ChatProvider } from '@/src/contexts/ChatContext'
import { useNearWallet } from '@/src/contexts/NearContext'

type ChatProps = {
  isMobile: boolean
}
export const Chat: FC<ChatProps> = ({ isMobile }) => {
  const { signedAccountId } = useNearWallet()
  const { balance } = useContract()

  useEffect(() => {
    if (signedAccountId) {
      balance()
    }
  }, [signedAccountId, balance])

  return <ChatProvider>{isMobile ? <MobileChat /> : <WebChat />}</ChatProvider>
}
