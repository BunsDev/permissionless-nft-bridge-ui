import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import dynamic from 'next/dynamic'
import { Box, Container } from '../common/Container'
import SelectBox from './SelectBox'
import { chains, validChains } from '../../constants/settings'
import { useMuonState } from '../../context'
import { Title, GradientTitle, TriangleDown, BoxDestination } from '.'
import NFTBox from './NFTBox'
import { Type } from '../common/Text'
import { NameChainMap } from '../../constants/chainsMap'
import MuonNetwork from '../common/MuonNetwork'
import NetworkHint from '../common/NetworkHint'
import NFTDropDown from './NFTDropDown'

const CopyTokenAddress = dynamic(() => import('./CopyTokenAddress'))
const Info = dynamic(() => import('./Info'))
const ActionButton = dynamic(() => import('./ActionButton'))

const Image = styled.img`
  // margin: 50px 0 20px;
`
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Deposit = (props) => {
  const {
    wrongNetwork,
    destChains,
    updateBridge,
    handleConnectWallet,
    handleAddMainToken,
    handleAddBridgeToken,
    handleDeposit,
    handleApprove,
    unsetProject,
    loading
  } = props
  const { state } = useMuonState()

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Title>Permissionless </Title>
      <GradientTitle margin="0 0 10px">Cross-Chain NFT Bridge</GradientTitle>

      <Container maxWidth="470px">
        <Box background="linear-gradient(0deg, #D3DBE3 0%, rgba(231, 235, 243, 0) 126.95%)">
          <Flex flexDirection="column" width="100%">
            <SelectBox
              label="Select Origin Chain"
              placeholder={`${NameChainMap[validChains[0]]}, ${
                NameChainMap[validChains[1]]
              }, ...`}
              data={chains}
              type="chain"
              value={state.bridge.fromChain.id}
              onChange={(data) => updateBridge('fromChain', data)}
              marginBottom={state.bridge.fromChain.id ? '5px' : '35px'}
            />
            {state.bridge.fromChain.id && <NetworkHint error={wrongNetwork} />}

            <NFTBox
              label="Select an Asset"
              data={state.showTokens}
              currentNFT={state.bridge.token}
              currentToken={state.bridge.nft}
              type="token"
              marginBottom={state.bridge.token ? '5px' : '35px'}
              border={
                state.bridge.fromChain && state.bridge.token?.id
                  ? !state.fromChainTokenExit
                    ? '1px solid rgba(220, 81, 81, 1)'
                    : '1px solid rgba(0, 227, 118, 1)'
                  : '1px solid #ffffff'
              }
              onProjectChange={(data) => {
                updateBridge('token', data)
              }}
              unsetProject={unsetProject}
              onNFTChange={(data) => {
                updateBridge('nft', data)
              }}
            />
            {state.bridge.token?.id && state.bridge.fromChain && (
              <Info
                generateBridge={state.fromChainTokenExit}
                chain={state.bridge.fromChain}
              />
            )}

            {state.bridge.token && state.bridge.fromChain && (
              <CopyTokenAddress marginBottom="5px" />
            )}
            <NFTDropDown 
              label="Select NFTs"
              marginBottom='10px'
            />
          </Flex>
        </Box>

        <TriangleDown />
        <BoxDestination>
          <SelectBox
            marginBottom={state.bridge.toChain.id ? '5px' : '35px'}
            label="Select Destination Chain"
            placeholder={`${NameChainMap[validChains[0]]}, ${
              NameChainMap[validChains[1]]
            }, ...`}
            data={destChains}
            type="chain"
            value={state.bridge.toChain.id}
            onChange={(data) => updateBridge('toChain', data)}
            border={
              state.bridge.toChain && state.bridge.token
                ? !state.toChainTokenExit
                  ? '1px solid rgba(220, 81, 81, 1)'
                  : '1px solid rgba(0, 227, 118, 1)'
                : '1px solid #ffffff'
            }
          />
          {state.bridge.token && state.bridge.toChain && (
            <>
              <Info
                generateBridge={state.toChainTokenExit}
                chain={state.bridge.toChain}
              />
              {state.toChainTokenExit && <CopyTokenAddress toChain={true} />}
            </>
          )}
        </BoxDestination>
      </Container>

      <ActionButton
        wrongNetwork={wrongNetwork}
        handleAddBridgeToken={handleAddBridgeToken}
        handleAddMainToken={handleAddMainToken}
        handleConnectWallet={handleConnectWallet}
        handleDeposit={handleDeposit}
        handleApprove={handleApprove}
        loading={loading}
      />
      <Flex justifyContent="center" margin="50px 0 20px">
        <Type.SM color="#313144" fontSize="10px" padding="10px">
          Powered by
        </Type.SM>
        <MuonNetwork logo="muonNetworkBlack" />
      </Flex>
    </Flex>
  )
}

export default Deposit
