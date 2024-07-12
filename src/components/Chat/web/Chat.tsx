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
  Typography
} from '@mui/material'
import { useChat } from '@/src/contexts/ChatContext'

import SendIcon from '@mui/icons-material/Send'
import { useNearWallet } from '@/src/contexts/NearContext'

export const Chat = () => {
  const { signedAccountId } = useNearWallet()
  const { model, message, chats, loading, onChangeMessage, onChangeModel, onSendMessage } = useChat()

  return (
    <Box
      sx={{ backgroundColor: 'whitesmoke', marginX: 'auto' }}
      textAlign='center'
      padding={2}
      borderRadius={2}
      marginTop={2}
      width={700}
    >
      <Grid container>
        <Box sx={{ marginX: 'auto', width: '100%' }} marginBottom={2}>
          <Typography variant='h6' color='GrayText'>
            Experimental Chat
          </Typography>
          <Box display='flex' justifyContent='space-between' sx={{ width: '100%', marginBottom: 1 }}>
            <Button variant='outlined' color='secondary' disableRipple sx={{ cursor: 'default' }}>
              {model}
            </Button>

            <Button variant='contained' color='secondary' onClick={onChangeModel} disabled={!signedAccountId}>
              Change Model
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid container>
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
              onChange={event => onChangeMessage(event.target.value)}
              value={message ? message : ''}
              label='Type Something'
              sx={{ width: '90%' }}
              disabled={loading}
            />
            <IconButton
              onClick={() => onSendMessage('ME', message)}
              disabled={loading || !signedAccountId}
              sx={{ backgroundColor: '#eff1f1', padding: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : <SendIcon color='info' fontSize='small' />}
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
