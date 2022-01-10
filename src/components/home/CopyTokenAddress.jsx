import dynamic from 'next/dynamic'
import React from 'react'
const CopyToClipboard = dynamic(() => import('react-copy-to-clipboard'))
// import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyBtn, WrapTokenAddress, WrapperInfo } from '.'
import { useMuonState } from '../../context'
import { getNFT } from '../../helper/Tokens'
import { useCrossWeb3 } from '../../hooks/useWeb3'
import { Type } from '../common/Text'

const CopyTokenAddress = (props) => {
  const { state } = useMuonState()
  const [copy, setCopy] = React.useState(false)
  const { toChain, marginBottom } = props
  const [token, setToken] = React.useState('')
  const web3 = useCrossWeb3(
    toChain ? state.bridge.toChain.id : state.bridge.fromChain.id
  )

  React.useEffect(() => {
    const findToken = async () => {
      let address =
        state.bridge.token.address[
          toChain ? state.bridge.toChain.id : state.bridge.fromChain.id
        ]
      // let token = state.tokens.find((item) => {
      //   return (
      //     item.address[
      //       toChain ? state.bridge.toChain.id : state.bridge.fromChain.id
      //     ] === address
      //   )
      // })
      // if (!token) {
      if (address) {
        let token = await getNFT(
          address,
          state.account,
          toChain ? state.bridge.toChain : state.bridge.fromChain,
          web3
        )
        // }
        setToken(token)
      }
    }
    findToken()
  }, [state.account, state.bridge.token, toChain])

  React.useEffect(() => {
    setCopy(false)

    return () => {
      setCopy(false)
    }
  }, [state.bridge.token])
  // alert(token)
  return (
    <WrapperInfo
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      marginBottom={marginBottom}
    >
      {token && (
        <>
          <WrapTokenAddress>
            <Type.SM
              fontSize="9px"
              color="#313144"
              fontSizeXXS="7px"
              padding="0 5px"
            >
              {`${token.symbol} ${
                toChain
                  ? state.bridge.toChain.symbol
                  : state.bridge.fromChain.symbol
              }:`}
            </Type.SM>
            <Type.SM fontSize="9px" color="#313144" fontSizeXXS="7px">
              {
                state.bridge.token.address[
                  toChain ? state.bridge.toChain.id : state.bridge.fromChain.id
                ]
              }
            </Type.SM>
          </WrapTokenAddress>
          <CopyToClipboard
            text={
              state.bridge.token.address[
                toChain ? state.bridge.toChain.id : state.bridge.fromChain.id
              ]
            }
            onCopy={() => setCopy(true)}
          >
            <CopyBtn>{copy ? 'copied' : 'copy'}</CopyBtn>
          </CopyToClipboard>
        </>
      )}
    </WrapperInfo>
  )
}

export default CopyTokenAddress
