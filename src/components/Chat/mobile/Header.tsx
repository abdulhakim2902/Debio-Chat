import { Token } from '@/src/contexts/ContractContext'
import { Avatar, Container, Typography } from '@mui/material'
import { FC } from 'react'

type HeaderProps = {
  model: string
  token: Token
}

export const Header: FC<HeaderProps> = ({ model, token }) => {
  return (
    <Container sx={{ bgcolor: '#551149', height: 60, position: 'fixed', top: 0, left: 0 }} maxWidth={'md'}>
      <Typography
        color={'#FFFFFF'}
        sx={{ position: 'fixed', top: 13, right: 17, fontSize: 10, fontFamily: 'Open Sans' }}
      >
        {' '}
        <b>Balance</b>: ${token.symbol} {token.formatted}{' '}
      </Typography>
      <Avatar
        alt='debio'
        src='public/debio-logo.svg'
        sx={{ position: 'fixed', height: 40, width: 40, left: 10, top: 10 }}
      />
      <div style={{ position: 'fixed', left: 57, top: 21 }}>
        <Typography color={'#FFFFFF'} sx={{ fontSize: 12, fontFamily: 'Open Sans' }}>
          {model.toUpperCase()}
        </Typography>
      </div>
    </Container>
  )
}
