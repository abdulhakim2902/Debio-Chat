import { useChat } from '@/src/contexts/ChatContext'
import { FC, Fragment } from 'react'
import { IoMdSend } from 'react-icons/io'
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
  TextField,
  Typography,
  Fab,
  Chip,
  Stack,
  Container,
  SxProps
} from '@mui/material'

import { ChatBox } from './Chatbox'

export type ChatProps = {}

export const Chat: FC<ChatProps> = ({}) => {
  const { model, message, chats, loading, onChangeMessage, onChangeModel, onSendMessage } = useChat()

  const colorHandler = (input: string) => {
    if (input === 'AI') {
      return 'primary'
    } else {
      return 'secondary'
    }
  }

  return (
    <Container maxWidth={'md'} sx={{ position: 'absolute', top: 80, left: 0, bottom: 30 }}>
      <div
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        {chats.map((c, i) => (
          <ChatBox key={i} msg={c.msg} user={c.from === 'ME'}></ChatBox>
        ))}
      </div>
      <TextField
        id='outlined-basic-email'
        InputProps={{
          disableUnderline: true
        }}
        onChange={event => onChangeMessage(event.target.value)}
        value={message}
        label='Type Something'
        sx={{ position: 'fixed', left: 13, bottom: 21, right: 70 }}
      />
      <div style={{ position: 'fixed', right: 6, bottom: 21 }}>
        <Fab
          color='primary'
          onClick={() => onSendMessage('ME', message)}
          aria-label='add'
          sx={{ position: 'sticky', right: 6, bottom: 21 }}
        >
          <IoMdSend />
        </Fab>
      </div>
    </Container>
  )
}
