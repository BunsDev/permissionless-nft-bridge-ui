import React from 'react'
import { Flex } from 'rebass'
import { useWeb3React } from '@web3-react/core'
import { Image, Selector } from './FormControls'
import Modal from './Modal'
import { ConnectorByName } from '../../utils/connectors'

const WalletModal = (props) => {
  const { open, hide } = props

  const web3React = useWeb3React()
  const { activate } = web3React
  return (
    <Modal open={open} hide={hide} title="Connect Wallet">
      {Object.keys(ConnectorByName).map((name) => {
        return (
          <Selector
            key={name}
            onClick={() => {
              activate(ConnectorByName[name])
              hide()
            }}
            style={{ width: '95%', cursor: 'pointer' }}
            margin="0 auto 10px auto"
          >
            <Flex
              padding="0 20px"
              justifyContent="space-between"
              width="100%"
              alignItems="center"
            >
              {name}
              <Image
                width="24px"
                height="24px"
                paddingRight="0"
                src={`/media/common/${name}.svg`}
              />
            </Flex>
          </Selector>
        )
      })}
    </Modal>
  )
}

export default WalletModal
