import dynamic from 'next/dynamic'
import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { Copy, CheckCircle } from 'react-feather'
import {
  LinkType,
  TransactionStatus,
  TransactionType
} from '../../constants/transactionStatus'
import { useMuonState } from '../../context'
import { getTransactionLink } from '../../utils/explorers'
import { Box } from './Container'
import { Button, Link } from './FormControls'
import { Type } from './Text'
import { ChangeNetwork, Span } from '../home'
import { Image as NftImage } from '../common/FormControls'

const CopyToClipboard = dynamic(() => import('react-copy-to-clipboard'))

const Close = styled.span`
  font-size: 12.5px;
  color: #919191;
  cursor: pointer;
`
const Image = styled.img`
  padding: 0 10px;
`
const ImageSpin = styled.img`
  padding: 0 10px;
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`
const Arrow = styled.span`
  padding: 0 3px 5px;
  color: #000000;
`
const CustomTransaction = () => {
  const { state, dispatch } = useMuonState()

  const setCopyTimer = () => {
    setCopy(true)
    setTimeout(() => {
      setCopy(false)
    }, 1500)
  }
  const [copy, setCopy] = React.useState(false)
  React.useEffect(() => {
    setCopy(false)
    return () => {
      setCopy(false)
    }
  }, [state.transaction])

  const handleClose = () => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: {
        status: ''
      }
    })
  }
  return (
    <Box
      padding="14px 20px"
      borderRadius="10px"
      background=" linear-gradient(0deg, #E7EBF3 0%, rgba(231, 235, 243, 0.25) 105.18%)"
      border="1px solid #ffffff"
    >
      <Flex
        justifyContent="space-between"
        width="100%"
        style={{ textTransform: 'capitalize' }}
      >
        <Type.SM color="#313144">{state.transaction.type}</Type.SM>
        <Close onClick={handleClose}>&times;</Close>
      </Flex>
      <Flex
        justifyContent="flex-start"
        width="100%"
        marginTop="15px"
        alignItems="center"
      >
        {state.transaction.fromChain && (
          <>
            <Type.SM color="#313144">{state.transaction.fromChain}</Type.SM>
            <Arrow>&rarr;</Arrow>
          </>
        )}
        <Type.SM color="#313144">{state.transaction.toChain}</Type.SM>
      </Flex>
      <Flex justifyContent="space-between" width="100%" marginTop="15px">
        {state.transaction.tokenSymbol && (
          <Flex alignItems="center">
            <Type.MD color="#313144" fontWeight="bold">
              {state.transaction.tokenSymbol}
            </Type.MD>
          </Flex>
        )}
        {state.transaction.amount ? (
          <Type.MD color="#313144" fontWeight="bold">
            {parseFloat(state.transaction.amount)}
          </Type.MD>
        ) : (
          ''
        )}
      </Flex>
      <Flex
        justifyContent="center"
        flexDirection="column"
        width="100%"
        margin="30px 0 15px"
      >
        <Button
          height="35px"
          background="rgba(255, 255, 255, 0.5)"
          border={
            state.transaction.status === TransactionStatus.PENDING
              ? '1px solid #d2d2d2'
              : state.transaction.status === TransactionStatus.SUCCESS
              ? '1px solid #00AA58'
              : '1px solid rgba(255, 164, 81, 1)'
          }
        >
          <Flex
            justifyContent="space-between"
            width="100%"
            padding="0 10px 0 0"
            alignItems="center"
          >
            <Flex maxWidth="300px" width="100%" alignItems="center">
              {state.transaction.status === 'pending' ? (
                <ImageSpin
                  src={`/media/common/${state.transaction.status}.svg`}
                />
              ) : (
                <Image src={`/media/common/${state.transaction.status}.svg`} />
              )}
              <Link
                target="_blink"
                href={getTransactionLink(
                  state.transaction.chainId,
                  state.transaction.hash,
                  LinkType.Transaction
                )}
              >
                <Type.SM
                  color={
                    state.transaction.status === TransactionStatus.SUCCESS
                      ? '#00AA58'
                      : '#313144'
                  }
                  fontSizeXS="10px"
                >
                  {state.transaction.message}
                </Type.SM>
              </Link>
            </Flex>
            <CopyToClipboard
              text={state.transaction.hash}
              onCopy={() => setCopy(true)}
            >
              {copy ? (
                <Type.XS color="#5551ff">copied</Type.XS>
              ) : (
                <img src="/media/common/copy.svg" />
              )}
            </CopyToClipboard>
          </Flex>
        </Button>
      </Flex>
    </Box>
  )
}

export default CustomTransaction
