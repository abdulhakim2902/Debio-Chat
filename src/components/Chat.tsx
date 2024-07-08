import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { FC, Fragment, ReactNode, useState } from 'react'

import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'

type ChatType = {
  from: string
  msg: ReactNode | string
  time: string
}

export type ChatProps = {
  session: number
  take: (value: string, cb: (err?: unknown) => void) => void
}

export const Chat: FC<ChatProps> = ({ take, session }) => {
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
    <Fragment>
      <Grid container>
        <Box sx={{ marginX: 'auto', width: '100%' }}>
          <Typography variant='h6' color='GrayText'>
            Experimental Chat
          </Typography>
          <Box display='flex' justifyContent='space-between' sx={{ width: '100%', marginBottom: 1 }}>
            <Button variant='outlined' color='secondary' disableRipple sx={{ cursor: 'default' }}>
              {model}
            </Button>

            <Button variant='contained' color='secondary' onClick={onChangeModel}>
              Change Model
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid container component={Paper}>
        <Grid item xs={12}>
          <List>
            {chats.map((c, i) => (
              <ListItem key={i}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText primary={c.msg}></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText secondary={c.from + ' at ' + c.time}></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ padding: '20px' }} display='flex' justifyContent='space-between' alignItems='center'>
            <TextField
              id='outlined-basic-email'
              InputProps={{
                disableUnderline: true
              }}
              size='small'
              onChange={event => setMessage(event.target.value)}
              value={message ? message : ''}
              label='Type Something'
              sx={{ width: '90%' }}
              disabled={isChatting}
            />
            <IconButton onClick={() => addMessage('ME', message)} edge='start' disabled={isChatting}>
              {isChatting ? <CircularProgress size={20} /> : <SendIcon color='info' />}
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Fragment>
  )
}
