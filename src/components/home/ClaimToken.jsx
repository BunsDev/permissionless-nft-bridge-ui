import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { NameChainMap } from '../../constants/chainsMap'
import { useMuonState } from '../../context'
import { addRPC } from '../../utils/addRPC'
import { findChain } from '../../utils/utils'

import { Box } from '../common/Container'
import { Image, Button, BorderBottom } from '../common/FormControls'
import { Type } from '../common/Text'
import { ChangeNetwork, Span } from '../home'

const NetWork = styled.div`
  /* width: 35px; */
  /* height: 15px; */
  background: rgba(255, 255, 255, 0.5);
  border: 0.5px solid #d2d2d2;
  box-sizing: border-box;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.005em;
  margin-left: 7px;
  padding: 1px 4px;
`

const ClaimToken = (props) => {
  const { state } = useMuonState()
  const { claims, handleClaim } = props

  return (
    <Box borderRadius="10px" padding="14px 20px 19px">
      <Flex width="100%">
        <Type.SM fontSize="12.5px" color="#919191" fontFamily="FH Oscar">
          Claim NFT
        </Type.SM>
      </Flex>
      {/* TODO: show info claim it has bug and I have to comment it */}
      {claims.map((claim, index) => {
        const chain = findChain(Number(claim.toChain))
        // const icon =
        //   claim.token.symbol.charAt(0) === 'μ'
        //     ? claim.token.symbol.split('-')[1].toLowerCase()
        //     : claim.token.symbol.toLowerCase()

        // let token = findTokenWithAddress(
        //   state.tokens,
        //   claim.tokenAddress,
        //   Number(claim.toChain)
        // )

        return (
          <Flex width="100%" padding="0 3px" key={index} flexDirection="column">
            <Flex
              justifyContent="space-between"
              width="100%"
              alignItems="center"
              padding="30px 0 0"
            >
              <Flex alignItems="center">
                {/* {state.transaction.icon && (
                  <Image
                    width={'89px'}
                    height={'89px'}
                    src={claim.tokenURI}
                    // onError={(e) => (e.target.src = currentNFT ? currentNFT.icon : defaultNFT.icon)}
                    boxSizing="unset"
                    borderRadius="5px"
                    paddingRight="0"
                  />
                )} */}
                <Type.LG
                  fontFamily="FH Oscar"
                  color="#313144"
                  fontSizeXS="16px"
                >
                  {`${claim.token.name} #${claim.nftId}`}
                </Type.LG>
                <NetWork>
                  <Type.XS
                    color="#313144"
                    fontSize="10.5px"
                    fontFamily="FH Oscar"
                  >
                    {chain.symbol}
                  </Type.XS>
                </NetWork>
              </Flex>
              {/* <Type.LG color="#313144" fontFamily="FH Oscar" fontSizeXS="16px">
                {amount}
              </Type.LG> */}
            </Flex>
            {Number(claim.toChain) === state.chainId ? (
              <Button
                margin="15px 0 30px"
                background="rgba(95, 92, 254, 1)"
                border="0.5px solid #D2D2D2"
                height="35px"
                onClick={() => handleClaim({ ...claim })}
              >
                <Type.SM
                  fontSize="12.5px"
                  color="#ffffff"
                  fontFamily="FH Oscar"
                  cursor="pointer"
                >
                  Claim NFT
                </Type.SM>
              </Button>
            ) : (
              <Button
                margin="15px 0 30px"
                background=" rgba(255, 164, 81, 0.2)"
                border="0.5px solid rgba(255, 164, 81, 1)"
                height="35px"
                onClick={() => addRPC(claim.toChain)}
              >
                <Type.SM
                  fontSize="12.5px"
                  color="#313144"
                  fontFamily="FH Oscar"
                >
                  Switch to {NameChainMap[claim.toChain]}
                </Type.SM>
              </Button>
            )}
            {claims.length - 1 !== index && <BorderBottom />}
          </Flex>
        )
      })}

      <ChangeNetwork padding="15px 10px 0">
        <Span> Switch to the destination Network </Span>
        to claim your token on respective networks.
      </ChangeNetwork>
    </Box>
  )
}

export default ClaimToken
