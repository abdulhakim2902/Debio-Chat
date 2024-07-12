import { Fragment } from 'react'
import { Header } from './Header'
import { Chat } from './Chat'
import { useChat } from '@/src/contexts/ChatContext'
import { useContract } from '@/src/contexts/ContractContext'

export const MobileChat = () => {
  const { token } = useContract()
  const { model } = useChat()

  return (
    <Fragment>
      <Header model={model} token={token} />
      <Chat />
    </Fragment>
  )
}
