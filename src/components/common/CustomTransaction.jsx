import dynamic from 'next/dynamic'
import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { Copy, CheckCircle } from 'react-feather';
import { LinkType, TransactionStatus, TransactionType } from '../../constants/transactionStatus'
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
  padding: 0 5px;
  font-size:11px;
  margin-bottom: 1.5px;
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
  console.log(state.transaction);
  return (
    <Box padding="14px 20px" borderRadius="10px">
      <Flex justifyContent="space-between" width="100%" style={{ textTransform: "capitalize" }}>
        <Type.SM fontSize="12.5px" color="#919191">{state.transaction.type}</Type.SM>
        <Close onClick={handleClose}>&times;</Close>
      </Flex>

      <Flex justifyContent="flex-start" width="100%" marginTop="15px" >
        {/* {state.transaction.icon && <NftImage
          width={"89px"}
          height={"89px"}
          src={`${state.transaction.icon}`}
          // onError={(e) => (e.target.src = currentNFT ? currentNFT.icon : defaultNFT.icon)}
          boxSizing="unset"
          borderRadius="5px"
          paddingRight="0"

        />} */}
        <div style={{ marginLeft: "20px" }}>
          <Flex justifyContent="flex-start" alignItems="flex-start" width="100%" alignItems="center" fontSize="12.5px" color="#313144">
            {state.transaction.fromChain &&
              <>
                <Type.SM >{state.transaction.fromChain}</Type.SM>
                <Arrow>&#10230;</Arrow>
              </>
            }
            <Type.SM >{state.transaction.toChain}</Type.SM>
          </Flex>
          <div style={{ marginTop: "3px" }}>
            <Type.LG color="#313144" fontSizeXS="16px">
              {` ${state.transaction.nftName || ''}`}
            </Type.LG>

            <Type.MD color="#6F7077" fontSizeXS="16px">
              {` ${state.transaction.tokenSymbol || ''}`}
            </Type.MD>
          </div>
        </div>
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
              ? '0.5px solid #d2d2d2'
              : state.transaction.status === TransactionStatus.SUCCESS
                ? '0.5px solid rgba(0, 227, 118, 1)'
                : '0.5px solid rgba(255, 164, 81, 1)'
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
                <ImageSpin src={`/media/common/${state.transaction.status}.svg`} />
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
                  fontSize="12.5px"
                  color="#313144"
                  fontSizeXS="10px"
                >
                  {state.transaction.message}
                </Type.SM>
              </Link>
            </Flex>
            <CopyToClipboard text={state.transaction.hash} onCopy={() => setCopyTimer()} >
              {copy ? <CheckCircle color="#5551ff" height="15px" /> : <Copy color="#5551FF" height="15px" />}
            </CopyToClipboard>
          </Flex>
        </Button>
      </Flex>
      {/* {state.transaction.type === TransactionType.DEPOSIT &&
        state.transaction.status === TransactionStatus.SUCCESS && (
          <ChangeNetwork padding="0 10px 7px">
            <Span> Change to the destination Network </Span>
            to claim your token on respective networks.
          </ChangeNetwork>
        )} */}
    </Box>
  )
}

export default CustomTransaction
