import { FormEvent, Fragment, useEffect, useState } from 'react'
import { useNearWallet } from '@/contexts/NearContext'
import { useContract } from '@/hooks/useContract'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material'
import { Chat } from '@/components/Chat'

export default function App() {
  const { wallet, signedAccountId } = useNearWallet()
  const { balance, take, burn, token, isBurning, isBuying, session, isLoadingBalance, buy } = useContract()

  const [label, setLabel] = useState<string | boolean>(true)
  const [openBurnModal, setOpenBurnModal] = useState(false)
  const [openBuyModal, setOpenBuyModal] = useState(false)
  const [burnAmount, setBurnAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')

  const handleCloseBurnModal = () => {
    setOpenBurnModal(false)
    setBurnAmount('')
  }

  const handleCloseBuyModal = () => {
    setOpenBuyModal(false)
    setBuyAmount('')
  }

  useEffect(() => {
    if (signedAccountId) {
      balance()
    }
  }, [signedAccountId, balance])

  useEffect(() => {
    if (!wallet) return

    if (signedAccountId) {
      setLabel(`Logout`)
    } else {
      setLabel('Login')
    }
  }, [signedAccountId, wallet])

  const action = () => {
    if (!wallet) return

    if (signedAccountId) {
      return wallet.signOut()
    }

    return wallet.signIn()
  }

  return (
    <Box padding={10} alignItems='center'>
      <Box display='flex' justifyContent='space-between' marginBottom={15}>
        <Box sx={{ visibility: !!signedAccountId ? 'visible' : 'hidden' }}>
          <Button
            variant='outlined'
            disableRipple
            sx={{ opacity: signedAccountId ? 1 : 0, cursor: 'default', height: '37px' }}
          >
            {signedAccountId}
          </Button>
          <Box marginTop={1} sx={{ color: 'GrayText' }}>
            <Typography>
              Total Balance: {isLoadingBalance ? <CircularProgress size={15} /> : token.formatted}
            </Typography>
            <Typography>Total Session: {isLoadingBalance ? <CircularProgress size={15} /> : session}</Typography>
          </Box>
        </Box>
        <Button variant='contained' onClick={action} sx={{ width: '100px', height: '37px' }}>
          {label === true ? <CircularProgress size={25} color='info' /> : label}
        </Button>
      </Box>
      {!!signedAccountId && (
        <Fragment>
          <Box
            sx={{ width: '30%', backgroundColor: 'whitesmoke', marginX: 'auto' }}
            textAlign='center'
            padding={2}
            borderRadius={2}
          >
            <Box display='flex' justifyContent='space-between'>
              <Button variant='outlined' color='error' onClick={() => setOpenBurnModal(true)}>
                Burn
              </Button>
              <Button variant='contained' color='info' onClick={() => setOpenBuyModal(true)}>
                Buy {token.symbol}
              </Button>
            </Box>
          </Box>

          <Box
            sx={{ width: '30%', backgroundColor: 'whitesmoke', marginX: 'auto' }}
            textAlign='center'
            padding={2}
            borderRadius={2}
            marginTop={2}
          >
            <Chat take={take} />
          </Box>
        </Fragment>
      )}
      <Dialog
        open={openBurnModal}
        onClose={handleCloseBurnModal}
        PaperProps={{
          component: 'form',
          onSubmit: (event: FormEvent) => {
            event.preventDefault()
            burn(burnAmount)
          }
        }}
      >
        <DialogTitle>Burn</DialogTitle>
        <DialogContent>
          <DialogContentText>To use the chat, please burn your {token.symbol} to get the session.</DialogContentText>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='amount'
            label='Amount'
            type='text'
            fullWidth
            value={burnAmount ? burnAmount : ''}
            variant='standard'
            onChange={event => {
              const value = event.target.value
              if (!isNaN(Number(value)) && Number(value) >= 0) {
                setBurnAmount(value)
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>{token.symbol}</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBurnModal} variant='outlined'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {isBurning ? 'Burning...' : 'Burn'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openBuyModal}
        onClose={handleCloseBuyModal}
        PaperProps={{
          component: 'form',
          onSubmit: (event: FormEvent) => {
            event.preventDefault()
            buy(buyAmount)
          }
        }}
      >
        <DialogTitle>Buy</DialogTitle>
        <DialogContent>
          <DialogContentText>Please buy more {token.symbol} to get the session.</DialogContentText>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='amount'
            label='Amount'
            type='text'
            fullWidth
            value={buyAmount ? buyAmount : ''}
            variant='standard'
            onChange={event => {
              const value = event.target.value
              if (!isNaN(Number(value)) && Number(value) >= 0) {
                setBuyAmount(value)
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>{token.symbol}</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBuyModal} variant='outlined'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {isBuying ? 'Buying...' : 'Buy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
