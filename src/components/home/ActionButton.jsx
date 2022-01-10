import { useWeb3React } from '@web3-react/core'
import React from 'react'
import styled from 'styled-components'
import { NameChainMap } from '../../constants/chainsMap'
import { validChains } from '../../constants/settings'
import {
  TransactionStatus,
  TransactionType
} from '../../constants/transactionStatus'
import { useMuonState } from '../../context'
import { addRPC } from '../../utils/addRPC'
import { Button, ImageSpin } from '../common/FormControls'
import { Type } from '../common/Text'

const ActionButtonStyle = styled(Button)`
  margin: 50px 0 0;
  background: ${({ active }) => (active ? '#5F5CFE' : '#B4B3FD')};
  border: ${({ active }) => (active ? 'transparent' : '1px solid #5F5CFE')};
  cursor: ${({ active }) => (active ? 'pointer' : 'default')};
`
const WarningButtonStyle = styled(ActionButtonStyle)`
  margin: 50px 0 0;
  background: rgba(255, 164, 81, 0.2);
  border: 1px solid rgba(255, 164, 81, 1);
  cursor: ${({ active }) => (active ? 'pointer' : 'default')};
`

const ActionText = styled(Type.LG).attrs({
  fontSizeXS: '16px'
})`
  color: ${({ active }) => (active ? '#ffffff' : '#313144')};
`

const ActionButton = (props) => {
  const {
    wrongNetwork,
    handleAddBridgeToken,
    handleAddMainToken,
    handleConnectWallet,
    handleDeposit,
    handleApprove,
    loading
  } = props
  const { state } = useMuonState()
  const { chainId } = useWeb3React()

  let validChainId = null
  if (state.bridge.fromChain && state.bridge.toChain) {
    if (
      state.actionBtnType === 'bridgeToChain' &&
      state.bridge.toChain.id !== chainId
    )
      validChainId = state.bridge.toChain.id
    else if (
      state.actionBtnType !== 'bridgeToChain' &&
      state.bridge.fromChain.id !== chainId
    )
      validChainId = state.bridge.fromChain.id
  }

  if (!state.account)
    return (
      <Button
        margin="50px 0 0"
        background="#5F5CFE"
        onClick={handleConnectWallet}
      >
        <Type.LG color="#ffffff" fontSizeXS="16px">
          Connect Wallet
        </Type.LG>
      </Button>
    )

  if (wrongNetwork || validChainId)
    return (
      <Button
        margin="25px 0 0"
        background={'rgba(255, 164, 81, 0.2)'}
        border="1px solid rgba(255, 164, 81, 1)"
        cursor="pointer"
        onClick={() =>
          wrongNetwork
            ? addRPC(
                state.bridge.fromChain.id
                  ? state.bridge.fromChain.id
                  : validChains[0]
              )
            : addRPC(validChainId)
        }
      >
        <Type.MD color={'rgba(49, 49, 68, 1)'} fontWeight="bold">
          {wrongNetwork
            ? ` Switch to ${
                NameChainMap[
                  state.bridge.fromChain.id
                    ? state.bridge.fromChain.id
                    : validChains[0]
                ]
              }`
            : ` Switch to ${NameChainMap[validChainId]}`}
        </Type.MD>
      </Button>
    )

  let content = ''
  switch (state.actionBtnType) {
    case 'bridgeFromChain':
      let mainTokenStatus =
        state.transaction.status === TransactionStatus.PENDING &&
        state.transaction.type === TransactionType.GENERATE_MAIN_TOKEN
      content = (
        <ActionButtonStyle
          onClick={handleAddMainToken}
          active={!mainTokenStatus}
        >
          <ActionText active={!mainTokenStatus}>
            {mainTokenStatus ? 'Generating Main NFT ...' : 'Generate Main NFT'}
          </ActionText>
        </ActionButtonStyle>
      )
      break
    case 'bridgeToChain':
      let bridgeTokenStatus =
        state.transaction.status === TransactionStatus.PENDING &&
        state.transaction.type === TransactionType.GENERATE_BRIDGE_TOKEN
      content = (
        <ActionButtonStyle
          onClick={handleAddBridgeToken}
          active={!bridgeTokenStatus}
        >
          <ActionText active={!bridgeTokenStatus}>
            {bridgeTokenStatus
              ? 'Generating Bridge NFT ...'
              : 'Generate Bridge NFT'}
            {loading && (
              <ImageSpin src="/media/common/loading.svg" alt="loading" />
            )}
          </ActionText>
        </ActionButtonStyle>
      )
      break
    case 'approve':
      let approveStatus =
        state.transaction.status === TransactionStatus.PENDING &&
        state.transaction.type === TransactionType.Approve

      content = (
        <ActionButtonStyle onClick={handleApprove} active={!approveStatus}>
          <ActionText active={!approveStatus}>
            {approveStatus ? 'Approving ...' : 'Approve'}
          </ActionText>
        </ActionButtonStyle>
      )
      break
    case 'deposit':
      let depositStatus =
        state.transaction.status === TransactionStatus.PENDING &&
        state.transaction.type === TransactionType.DEPOSIT
      content = (
        <ActionButtonStyle onClick={handleDeposit} active={!depositStatus}>
          <ActionText active={!depositStatus}>
            {depositStatus ? 'Depositing ...' : 'Deposit Asset'}
          </ActionText>
        </ActionButtonStyle>
      )
      break
    case 'select':
      content = (
        <Button
          margin="25px 0 0"
          cursor="default"
          background="rgba(85, 81, 255, 0.15)"
        >
          <Type.LG color="#8888db" fontSizeXS="16px" fontSizeXXS="14px">
            Select Asset and Chains
          </Type.LG>
        </Button>
      )
      break
    case 'notOwner':
      content = (
        <WarningButtonStyle active={false}>
          <Type.LG color="rgba(49, 49, 68, 1)" fontSizeXS="16px">
            You’re not the owner of this NFT
          </Type.LG>
        </WarningButtonStyle>
      )
      break
    case 'error':
      content = (
        <WarningButtonStyle active={false}>
          <Type.LG color="rgba(49, 49, 68, 1)" fontSizeXS="16px">
            Please input correct id(s)
          </Type.LG>
        </WarningButtonStyle>
      )
      break

    default:
      break
  }

  return content
}

export default ActionButton
