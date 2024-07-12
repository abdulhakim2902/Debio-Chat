import { useContract } from '@/src/contexts/ContractContext'
import { useNearWallet } from '@/src/contexts/NearContext'
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
import { FormEvent, Fragment, useEffect, useState } from 'react'

export const Header = () => {
  const { wallet, signedAccountId } = useNearWallet()

  const { loading, token, session, burn, buy } = useContract()

  const [openBurnModal, setOpenBurnModal] = useState(false)
  const [openBuyModal, setOpenBuyModal] = useState(false)
  const [burnAmount, setBurnAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [label, setLabel] = useState<string | boolean>(true)

  const handleCloseBurnModal = () => {
    setOpenBurnModal(false)
    setBurnAmount('')
  }

  const handleCloseBuyModal = () => {
    setOpenBuyModal(false)
    setBuyAmount('')
  }
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
    <Fragment>
      <Box
        display='flex'
        justifyContent={signedAccountId ? 'space-between' : 'flex-end'}
        sx={{ backgroundColor: 'whitesmoke', marginX: 'auto' }}
        padding={2}
        borderRadius={2}
      >
        {signedAccountId && (
          <Box>
            <Button
              variant='outlined'
              disableRipple
              sx={{ opacity: signedAccountId ? 1 : 0, cursor: 'default', height: '37px' }}
            >
              {signedAccountId}
            </Button>
            <Box marginTop={1} sx={{ color: 'GrayText' }}>
              <Typography>
                Total Balance: {loading.balance ? <CircularProgress size={15} /> : token.formatted}
              </Typography>
              <Typography>Total Session: {loading.balance ? <CircularProgress size={15} /> : session}</Typography>
            </Box>
          </Box>
        )}

        <Button variant='contained' onClick={action} sx={{ width: '100px', height: '37px' }}>
          {label === true ? <CircularProgress size={25} color='info' /> : label}
        </Button>
      </Box>
      <Box
        sx={{ backgroundColor: 'whitesmoke', marginX: 'auto' }}
        textAlign='center'
        padding={2}
        borderRadius={2}
        marginTop={2}
      >
        <Box display='flex' justifyContent='space-between'>
          <Button variant='outlined' color='error' disabled={!signedAccountId} onClick={() => setOpenBurnModal(true)}>
            Burn
          </Button>
          <Button variant='contained' color='info' disabled={!signedAccountId} onClick={() => setOpenBuyModal(true)}>
            Buy {token.symbol}
          </Button>
        </Box>
      </Box>
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
            {loading.burn ? 'Burning...' : 'Burn'}
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
            {loading.buy ? 'Buying...' : 'Buy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
