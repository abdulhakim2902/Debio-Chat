import axios from 'axios'

import { createContext, FC, ReactNode, useContext, useState } from 'react'
import { useContract } from './ContractContext'
import { enqueueSnackbar } from 'notistack'
import { CircularProgress } from '@mui/material'

export type ChatContextValue = {
  loading: boolean
  message: string
  model: string
  chats: ChatType[]

  onChangeMessage: (value: string) => void
  onChangeModel: () => void
  onSendMessage: (from: string, msg: string) => void
}

export const ChatContext = createContext<ChatContextValue>({
  loading: false,
  message: '',
  model: 'Llama3',
  chats: [],

  onChangeMessage: () => {},
  onChangeModel: () => {},
  onSendMessage: () => {}
})

type ChatProviderProps = {
  children: ReactNode
}

type ChatType = {
  from: string
  msg: ReactNode | string
  time: string
}

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const { session, take } = useContract()

  const [message, setMessage] = useState('')
  const [model, setModel] = useState('Llama3')
  const [isChatting, setIsChatting] = useState(false)
  const [chats, setChats] = useState<ChatType[]>([{ from: 'AI', msg: 'Hello, this is a trial chat ai', time: '15:55' }])

  const onChangeModel = () => {
    if (model === 'Llama3') {
      setModel('OpenAI')
    } else {
      setModel('Llama3')
    }
  }

  const addResponse = async (msg: string) => {
    if (model === 'Llama3') {
      addResponseLLama3(msg)
    } else if (model === 'OpenAI') {
      addResponseOpenAI(msg)
    } else {
      throw new Error('Model Error')
    }
  }

  const addResponseLLama3 = async (msg: string) => {
    const time = new Date().toLocaleTimeString().slice(0, 5)
    const loadingRespons = { from: 'AI', msg: <CircularProgress size={15} />, time }
    setIsChatting(true)
    setChats(prev => [...prev, loadingRespons])

    if (session <= 0) {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const forbidden = "You don't have session"
      const response = { from: 'AI', msg: forbidden, time }

      setChats(prev => [...prev.slice(0, prev.length - 1), response])
      setIsChatting(false)
      return
    }

    try {
      const answer = await axios.post('https://x.myriadchain.com/llm/api/generate', {
        model: 'llama3',
        prompt: msg,
        stream: false
      })

      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = { from: 'AI', msg: answer.data.response, time }

      take('1', err => {
        if (err) {
          setChats(prev => [...prev.slice(0, prev.length - 1)])
          return
        }

        setChats(prev => [...prev.slice(0, prev.length - 1), response])
      })
    } catch (err: any) {
      setChats(prev => [...prev.slice(0, prev.length - 1)])
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setIsChatting(false)
    }
  }

  const addResponseOpenAI = async (msg: string) => {
    const time = new Date().toLocaleTimeString().slice(0, 5)
    const loadingRespons = { from: 'AI', msg: <CircularProgress size={15} />, time }
    setIsChatting(true)
    setChats(prev => [...prev, loadingRespons])

    if (session <= 0) {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const forbidden = "You don't have session"
      const response = { from: 'AI', msg: forbidden, time }

      setChats(prev => [...prev.slice(0, prev.length - 1), response])
      setIsChatting(false)
      return
    }

    try {
      const answer = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
        msg: msg
      })

      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = { from: 'AI', msg: answer.data.response, time }

      take('1', err => {
        if (err) {
          setChats(prev => [...prev.slice(0, prev.length - 1)])
          setIsChatting(false)
          return
        }

        setChats(prev => [...prev.slice(0, prev.length - 1), response])
        setIsChatting(false)
      })
    } catch (err: any) {
      setChats(prev => [...prev.slice(0, prev.length - 1)])
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    }
  }

  const addMessage = async (from: string, msg: string) => {
    if (msg.trim() === '') return
    // get the current time hh:mm
    const time = new Date().toLocaleTimeString().slice(0, 5)
    setChats(prev => [...prev, { from, msg, time }])
    setMessage('')
    addResponse(msg)
  }

  return (
    <ChatContext.Provider
      value={{
        message,
        model,
        loading: isChatting,
        chats,
        onChangeMessage: setMessage,
        onChangeModel,
        onSendMessage: addMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
