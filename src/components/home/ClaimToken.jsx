import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { NameChainMap } from '../../constants/chainsMap'
import { useMuonState } from '../../context'
import { addRPC } from '../../utils/addRPC'
import { findChain } from '../../utils/utils'

import { Box } from '../common/Container'
import { Image, Button, BorderBottom, ImageSpin } from '../common/FormControls'
import { Type } from '../common/Text'
import { ChangeNetwork, Span } from '../home'

const NetWork = styled.div`
  width: 50px;
  height: 15px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #d0d0d3;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.005em;
  margin-left: 7px;
`

const ClaimToken = (props) => {
  const { state } = useMuonState()
  const { claims, handleClaim, lock } = props

  return (
    <Box
      borderRadius="10px"
      padding="14px 20px 19px"
      background="linear-gradient(0deg, #E7EBF3 0%, rgba(231, 235, 243, 0.25) 105.18%)"
      border="1px solid #ffffff"
    >
      <Flex width="100%">
        <Type.SM color="#313144">Claim Token</Type.SM>
      </Flex>
      {claims.map((claim, index) => {
        const chain = findChain(Number(claim.toChain))

        return (
          <Flex width="100%" padding="0 3px" key={index} flexDirection="column">
            <Flex
              justifyContent="space-between"
              width="100%"
              alignItems="center"
              padding="30px 0 0"
            >
              <Flex alignItems="center">
                <Type.MD color="#313144" fontWeight="bold">
                  {`${claim.token.name} #${claim.nftId}`}
                </Type.MD>
                <NetWork>
                  <Type.XS color="#313144" fontSize="9px">
                    {chain.symbol}
                  </Type.XS>
                </NetWork>
              </Flex>
            </Flex>
            {Number(claim.toChain) === state.chainId ? (
              <Button
                margin="15px 0 30px"
                background="rgba(95, 92, 254, 1)"
                border="0.5px solid #D2D2D2"
                height="35px"
                onClick={() => handleClaim({ ...claim })}
              >
                <Type.SM fontSize="12.5px" color="#ffffff" cursor="pointer">
                  Claim NFT
                </Type.SM>
                {lock &&
                  lock.fromChain === claim.fromChain &&
                  lock.toChain === claim.toChain &&
                  lock.txId === claim.txId && (
                    <ImageSpin src={`/media/common/loading.svg`} />
                  )}
              </Button>
            ) : (
              <Button
                margin="15px 0 30px"
                background={'rgba(255, 164, 81, 0.2)'}
                border="1px solid rgba(255, 164, 81, 1)"
                height="35px"
                cursor="pointer"
                onClick={() => addRPC(claim.toChain)}
              >
                <Type.SM fontSize="12.5px" color="#313144">
                  Switch to {NameChainMap[claim.toChain]}
                </Type.SM>
              </Button>
            )}
            {claims.length - 1 !== index && <BorderBottom />}
          </Flex>
        )
      })}
      <ChangeNetwork padding="0 10px">
        <Span> Switch to the destination Network </Span>
        to claim your token on respective networks.
      </ChangeNetwork>
    </Box>
  )
}

export default ClaimToken
