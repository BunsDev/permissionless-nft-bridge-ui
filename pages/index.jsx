import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Muon from 'muon'
import { useWeb3React } from '@web3-react/core'
import { useMuonState } from '../src/context'
import { findChain, findTokenWithAddress, toWei } from '../src/utils/utils'
import { chains, NFT, validChains } from '../src/constants/settings'
import {
  Tab,
  TabContainer,
  Wrapper,
  DepositWrapper,
  BoxWrapper,
  ClaimWrapper,
  Badge
} from '../src/components/home'
import { NameChainMap } from '../src/constants/chainsMap'
import {
  TransactionStatus,
  TransactionType
} from '../src/constants/transactionStatus'
import {
  addTokenToLocalstorage,
  findAndAddToken,
  getNFT
} from '../src/helper/Tokens'
import useWeb3, { useCrossWeb3 } from '../src/hooks/useWeb3'
import { ERC721_ABI, MuonNFTBridge_ABI } from '../src/constants/ABI'
import { MuonNFTBridge } from '../src/constants/contracts'
import { makeContract } from '../src/helper'
import { AddressZero } from '@ethersproject/constants'
import { Type } from '../src/components/common/Text'
import axios from 'axios'
import multicall from '../src/helper/multicall'

const ClaimToken = dynamic(() => import('../src/components/home/ClaimToken'))
const CustomTransaction = dynamic(() =>
  import('../src/components/common/CustomTransaction')
)
const Deposit = dynamic(() => import('../src/components/home/Deposit'))
const WalletModal = dynamic(() =>
  import('../src/components/common/WalletModal')
)

const HomePage = () => {
  const { account, chainId } = useWeb3React()
  const { state, dispatch } = useMuonState()
  const [lock, setLock] = React.useState('')
  const web3 = useWeb3()
  const [checkDestToken, setCheckDestToken] = React.useState('')
  const [claims, setClaims] = React.useState([])
  const [wrongNetwork, setWrongNetwork] = React.useState(false)
  const [fetch, setFetch] = React.useState('')
  const [destChains, setDestChains] = React.useState([])
  const [open, setOpen] = React.useState(false)
  const [errorAmount, setErrorAmount] = React.useState(false)
  const [active, setActive] = React.useState('bridge')
  const [loading, setLoading] = React.useState(false)
  const muon = new Muon(process.env.NEXT_PUBLIC_MUON_NODE_GATEWAY)
  let crossWeb3
  for (let index = 0; index < validChains.length; index++) {
    const chainId = validChains[index]
    const web3 = useCrossWeb3(chainId)
    crossWeb3 = { ...crossWeb3, [chainId]: web3 }
  }
  React.useEffect(() => {
    dispatch({
      type: 'CLEAN_DATA'
    })
  }, [account])

  React.useEffect(() => {
    if (!validChains.includes(chainId)) {
      setWrongNetwork(true)
    }
    return () => {
      setWrongNetwork(false)
    }
  }, [chainId, state.bridge, account])

  React.useEffect(() => {
    const searchToken = async () => {
      if (
        state.tokenSearchQuery &&
        crossWeb3[state.bridge.fromChain.id]
      ) {
        let result = await findAndAddToken(
          state.tokenSearchQuery,
          state.tokens,
          state.account,
          state.bridge.fromChain,
          crossWeb3[state.bridge.fromChain.id]
        )
        dispatch({
          type: 'UPDATE_SHOW_TOKENS',
          payload: result.resultFilter
        })
        if (result.token) {
          dispatch({
            type: 'ADD_NEW_TOKEN',
            payload: result.token
          })
        }
      } else {
        dispatch({
          type: 'UPDATE_SHOW_TOKENS',
          payload: state.tokens
        })
      }
    }
    searchToken()
  }, [state.tokenSearchQuery, account, crossWeb3[state.bridge.fromChain.id]])

  React.useEffect(() => {
    const filter = chains.filter(
      (item) => item.id !== state.bridge.fromChain.id
    )
    setDestChains(filter)
  }, [state.bridge.fromChain])

  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_NETWORK_INFO',
      payload: {
        account,
        chainId,
        network: NameChainMap[chainId]
      }
    })
  }, [account, chainId])

  React.useEffect(() => {
    const findClaim = async () => {
      let claims = []

      // for (let index = 0; index < chains.length; index++) {
      //   const chain = chains[index]
      //   let dest = chains.filter((item) => item.id !== chain.id)
      //   let userTxs = []
      //   let userTxsResponse = []
      //   let pendingClaimTxs = []
      //   for (let i = 0; i < dest.length; i++) {
      //     const destChainId = dest[i].id

      //     const userTx = {
      //       address: MuonNFTBridge[chain.id],
      //       name: 'getUserTxs',
      //       params: [account, destChainId]
      //     }
      //     userTxs.push(userTx)
      //   }

      //   try {
      //     const mul = await multicall(
      //       chain.web3,
      //       MuonNFTBridge_ABI,
      //       userTxs,
      //       chain.id
      //     )
      //     userTxsResponse = mul
      //   } catch (error) {
      //     console.log('Error happend in geting getUserTxs', error)
      //   }
      //   for (let i = 0; i < dest.length; i++) {
      //     try {
      //       let destContract = makeContract(
      //         dest[i].web3,
      //         MuonNFTBridge_ABI,
      //         MuonNFTBridge[dest[i].id]
      //       )
      //       let pendingTxs = await destContract.methods
      //         .pendingTxs(
      //           chain.id,
      //           userTxsResponse[i][0].map((resp) => resp.toString())
      //         )
      //         .call()
      //       const pendingIndex = pendingTxs.reduce(
      //         (out, bool, index) =>
      //           bool ? out : out.concat(userTxsResponse[i][0][index]),
      //         []
      //       )
      //       pendingClaimTxs = [...pendingClaimTxs, ...pendingIndex]
      //     } catch (error) {
      //       console.log('Error happend in geting pendingTxs ', error)
      //     }
      //   }
      //   const Txs = []
      //   for (let j = 0; j < pendingClaimTxs.length; j++) {
      //     const tx = {
      //       address: MuonNFTBridge[chain.id],
      //       name: 'txs',
      //       params: [pendingClaimTxs[j]]
      //     }
      //     Txs.push(tx)
      //   }

      //   try {
      //     const mul = await multicall(
      //       chain.web3,
      //       MuonNFTBridge_ABI,
      //       Txs,
      //       chain.id
      //     )
      //     claims = [...claims, ...mul]
      //   } catch (error) {
      //     console.log('Error happend in geting Txs ', error)
      //   }
      // }

      let originContract = makeContract(
        crossWeb3[state.bridge.fromChain.id],
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.bridge.fromChain.id]
      )
      let destContract = makeContract(
        crossWeb3[state.bridge.toChain.id],
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.bridge.toChain.id]
      )
      try {
        let userTxs = await originContract.methods
          .getUserTxs(account, state.bridge.toChain.id)
          .call()
        let pendingTxs = await destContract.methods
          .pendingTxs(state.bridge.fromChain.id, userTxs)
          .call()

        const pendingIndex = pendingTxs.reduce(
          (out, bool, index) => (bool ? out : out.concat(index)),
          []
        )

        for (let index = 0; index < pendingIndex.length; index++) {
          let claim = await originContract.methods
            .getTx(userTxs[pendingIndex[index]])
            .call()
          let tokenAddress = await destContract.methods
            .tokens(claim.tokenId)
            .call()
          let customTokens = JSON.parse(localStorage.getItem('tokens'))

          let finalTokens = customTokens
            ? [...state.tokens, ...customTokens]
            : state.tokens
          let token = findTokenWithAddress(
            finalTokens,
            tokenAddress,
            state.bridge.toChain.id
          )
          if (!token) {
            token = await getNFT(
              tokenAddress,
              account,
              state.bridge.toChain,
              crossWeb3[state.bridge.toChain.id]
            )
          }
          claims.push({ ...claim, token })
        }
      } catch (error) {
        console.log('error happend in get Claim', error)
      }

      setClaims(claims)
      if (claims.length === 0) setActive('bridge')
    }

    // const findClaim = async () => {
    //   let claims = []

    //   for (let index = 0; index < chains.length; index++) {
    //     const chain = chains[index]

    //     let originContract = makeContract(
    //       crossWeb3[chain.id],
    //       MuonNFTBridge_ABI,
    //       MuonNFTBridge[chain.id]
    //     )

    //     let dest = chains.filter((item) => item.id !== chain.id)
    //     for (let index = 0; index < dest.length; index++) {
    //       const item = dest[index]

    //       let destContract = makeContract(
    //         crossWeb3[item.id],
    //         MuonNFTBridge_ABI,
    //         MuonNFTBridge[item.id]
    //       )

    //       try {
    //         let userTxs = await originContract.methods
    //           .getUserTxs(account, item.id)
    //           .call()

    //         let pendingTxs = await destContract.methods
    //           .pendingTxs(chain.id, userTxs)
    //           .call()
    //         const pendingIndex = pendingTxs.reduce(
    //           (out, bool, index) => (bool ? out : out.concat(index)),
    //           []
    //         )

    //         for (let index = 0; index < pendingIndex.length; index++) {
    //           let claim = await originContract.methods
    //             .getTx(userTxs[pendingIndex[index]])
    //             .call()
    //           let tokenAddress = await destContract.methods
    //             .tokens(claim.tokenId)
    //             .call()
    //           let customTokens = JSON.parse(localStorage.getItem('tokens'))

    //           let finalTokens = customTokens
    //             ? [...state.tokens, ...customTokens]
    //             : state.tokens
    //           let token = findTokenWithAddress(
    //             finalTokens,
    //             tokenAddress,
    //             item.id
    //           )
    //           if (!token) {
    //             token = await getNFT(
    //               tokenAddress,
    //               account,
    //               item,
    //               crossWeb3[item.id]
    //             )
    //           }

    //           claims.push({ ...claim, token })
    //         }
    //       } catch (error) {
    //         console.log('error happened in find Claim', error)
    //       }
    //     }
    //   }

    //   setClaims(claims)
    //   if (claims.length === 0) setActive('bridge')
    // }

    if (
      account &&
      crossWeb3[state.bridge.toChain.id] &&
      crossWeb3[state.bridge.fromChain.id]
    ) {
      findClaim()
    }

    // const interval = setInterval(() => {
    //   if (
    //     account &&
    //     crossWeb3[state.bridge.toChain.id] &&
    //     crossWeb3[state.bridge.fromChain.id]
    //   ) {
    //     findClaim()
    //   }
    // }, 15000)

    // return () => clearInterval(interval)
  }, [
    account,
    fetch,
    crossWeb3[state.bridge.toChain.id],
    crossWeb3[state.bridge.fromChain.id]
  ])

  React.useEffect(() => {
    const checkToken = async () => {
      if (
        state.bridge.toChain &&
        state.bridge.tokenId &&
        crossWeb3[state.bridge.toChain.id]
      ) {
        const Contract = makeContract(
          crossWeb3[state.bridge.toChain.id],
          MuonNFTBridge_ABI,
          MuonNFTBridge[state.bridge.toChain.id]
        )

        let address = await Contract.methods.tokens(state.bridge.tokenId).call()
        if (address !== AddressZero) {
          let selectedToken = {
            ...state.bridge.token,
            address: {
              ...state.bridge.token.address,
              [state.bridge.toChain.id]: address
            }
          }
          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field: 'token',
              value: selectedToken
            }
          })
        }

        dispatch({
          type: 'UPDATE_TO_CHAIN_TOKEN_EXIST',
          payload: address !== AddressZero
        })
      }
    }
    checkToken()
  }, [
    state.bridge.tokenId,
    state.bridge.toChain,
    checkDestToken,
    crossWeb3[state.bridge.toChain.id]
  ])
  const updateBridge = async (field, value) => {
    try {
      switch (field) {
        case 'fromChain':
          dispatch({
            type: 'UPDATE_BRIDGE_FROMCHAIN',
            payload: {
              field,
              value
            }
          })
          dispatch({
            type: 'UPDATE_SELECTED_ASSET',
            payload: ''
          })
          break
        case 'toChain':
          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field,
              value
            }
          })
          break
        case 'project':
          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field: 'token',
              value
            }
          })
          break
        case 'nft':
          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field,
              value
            }
          })
          break
        case 'token':
          // Search in fromChain
          const FromChainContract = makeContract(
            crossWeb3[state.bridge.fromChain.id],
            MuonNFTBridge_ABI,
            MuonNFTBridge[state.bridge.fromChain.id]
          )

          const tokenId = await FromChainContract.methods
            .getTokenId(value.address[state.bridge.fromChain.id])
            .call()

          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field,
              value
            }
          })
          dispatch({
            type: 'UPDATE_SELECTED_ASSET',
            payload: value.address[state.bridge.fromChain.id]
          })

          if (tokenId === '0') {
            dispatch({
              type: 'UPDATE_ACTION_BUTTON_TYPE',
              payload: 'bridgeFromChain'
            })
            dispatch({
              type: 'UPDATE_TO_CHAIN_TOKEN_EXIST',
              payload: false
            })
          } else {
            setCheckDestToken(new Date().getTime())
            dispatch({
              type: 'FROM_CHAIN_TOKEN_ID',
              payload: tokenId
            })
          }
          dispatch({
            type: 'UPDATE_FROM_CHAIN_TOKEN_EXIST',
            payload: tokenId !== '0'
          })

        default:
          break
      }
    } catch (error) {
      console.log('error happened in update bridge', error)
    }
  }

  React.useEffect(() => {
    const getTokenURI = async () => {
      const Contract = makeContract(
        crossWeb3[state.bridge.fromChain.id],
        ERC721_ABI,
        state.bridge.token.address[state.bridge.fromChain.id]
      )
      try {
        const tokenURI = await Contract.methods
          .tokenURI(state.bridge.nft.id[0])
          .call()
        if (tokenURI) {
          const res = await axios.post(process.env.NEXT_PUBLIC_MUON_NFT_PROXY, {
            url: tokenURI
          })
          dispatch({
            type: 'UPDATE_NFT',
            payload: res.data
          })
        }
      } catch (error) {
        console.log('Error happend in Get Token URI', error)
      }
    }

    if (
      state.bridge.nft?.id &&
      state.bridge.token.address &&
      crossWeb3[state.bridge.fromChain.id]
    ) {
      getTokenURI()
    }
  }, [
    state.bridge.token,
    state.bridge.nft?.id,
    crossWeb3[state.bridge.fromChain.id]
  ])

  React.useEffect(() => {
    const checkApprove = async () => {
      const Contract = makeContract(
        crossWeb3[state.bridge.fromChain.id],
        ERC721_ABI,
        state.bridge.token.address[state.bridge.fromChain.id]
      )
      // console.log(account, state.bridge.token.address[state.bridge.fromChain.id]);

      // TODO check out of bound

      let calls = []
      for (let i = 0; i < state.bridge.nft.id.length; i++) {
        calls.push({
          address: state.bridge.token.address[state.bridge.fromChain.id],
          name: 'ownerOf',
          params: [state.bridge.nft.id[i]]
        })
      }
      let notOwnerIds = []
      try {
        const owners = await multicall(
          crossWeb3[state.bridge.fromChain.id],
          ERC721_ABI,
          calls,
          state.bridge.fromChain.id
        )
        for (let i = 0; i < owners.length; i++) {
          if (owners[i][0] !== account) {
            notOwnerIds.push(state.bridge.nft.id[i])
          }
        }
        dispatch({
          type: 'UPDATE_WRONG_ID',
          payload: false
        })
      } catch (error) {
        dispatch({
          type: 'UPDATE_WRONG_ID',
          payload: true
        })
        console.log('multicall error happened  in approve', error)
        return
      }

      if (notOwnerIds.length > 0) {
        dispatch({
          type: 'UPDATE_OWNER',
          payload: false
        })
        return
      } else {
        dispatch({
          type: 'UPDATE_OWNER',
          payload: true
        })
      }

      let approve = await Contract.methods
        .isApprovedForAll(account, MuonNFTBridge[state.bridge.fromChain.id])
        .call()

      if (approve) {
        dispatch({
          type: 'UPDATE_APPROVE',
          payload: true
        })
      } else {
        dispatch({
          type: 'UPDATE_APPROVE',
          payload: false
        })
      }
    }
    if (
      account &&
      state.bridge.fromChain &&
      state.bridge.token &&
      state.bridge.nft.id &&
      crossWeb3[state.bridge.fromChain.id]
    )
      checkApprove()
  }, [
    state.bridge.fromChain,
    state.bridge.token,
    state.bridge.nft,
    account,
    crossWeb3[state.bridge.fromChain.id]
  ])

  const handleConnectWallet = async () => {
    setOpen(true)
  }

  React.useEffect(() => {
    if (!state.fromChainTokenExit && state.bridge.fromChain) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'bridgeFromChain'
      })
      return
    }
    if (!state.toChainTokenExit && state.bridge.token) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'bridgeToChain'
      })
      return
    }
    if (
      state.fromChainTokenExit &&
      state.toChainTokenExit &&
      state.bridge.fromChain &&
      state.bridge.token &&
      state.bridge.nft &&
      state.bridge.toChain &&
      state.error
    ) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'error'
      })
      return
    }
    if (
      state.fromChainTokenExit &&
      state.toChainTokenExit &&
      state.bridge.fromChain &&
      state.bridge.token &&
      state.bridge.nft?.id &&
      state.bridge.toChain &&
      !state.owner
    ) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'notOwner'
      })
      return
    }
    if(!state.bridge.nft?.id)
    {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'select'
      })
      return;
    }
    if (
      state.fromChainTokenExit &&
      state.toChainTokenExit &&
      state.bridge.fromChain &&
      state.bridge.token &&
      state.bridge.nft &&
      state.bridge.toChain &&
      state.owner &&
      !state.approve
    ) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'approve'
      })
      return
    }
    if (
      state.fromChainTokenExit &&
      state.toChainTokenExit &&
      state.bridge.fromChain &&
      state.bridge.token &&
      state.bridge.toChain &&
      state.owner &&
      state.approve
    ) {
      dispatch({
        type: 'UPDATE_ACTION_BUTTON_TYPE',
        payload: 'deposit'
      })
      return
    }
  }, [
    state.bridge,
    state.fromChainTokenExit,
    state.toChainTokenExit,
    account,
    state.approve
  ])

  const handleApprove = async () => {
    try {
      if (!state.account || state.approve) return

      if (state.bridge.fromChain.id !== state.chainId) {
        setWrongNetwork(true)
        return
      }
      if (
        state.transaction.type === TransactionType.Approve &&
        state.transaction.status === TransactionStatus.PENDING
      ) {
        return
      }
      let hash = ''
      let Contract = makeContract(
        web3,
        ERC721_ABI,
        state.bridge.token.address[state.bridge.fromChain.id]
      )
      Contract.methods
        .setApprovalForAll(MuonNFTBridge[state.bridge.fromChain.id], true)
        .send({ from: state.account })
        .once('transactionHash', (tx) => {
          hash = tx
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.Approve,
              hash,
              message: 'Approving transaction is pending',
              status: TransactionStatus.PENDING,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.name
            }
          })
        })
        .once('receipt', ({ transactionHash }) => {
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.Approve,
              hash: transactionHash,
              message: 'Transaction successful',
              status: TransactionStatus.SUCCESS,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.name
            }
          })
          dispatch({
            type: 'UPDATE_APPROVE',
            payload: true
          })
          dispatch({
            type: 'UPDATE_ACTION_BUTTON_TYPE',
            payload: 'deposit'
          })
        })
        .once('error', (error) => {
          if (!hash) {
            dispatch({
              type: 'UPDATE_TRANSACTION',
              payload: {
                type: TransactionType.Approve,
                message: 'Transaction rejected',
                icon: state.bridge.nft.logo,
                status: TransactionStatus.FAILED,
                chainId: state.bridge.fromChain.id,
                fromChain: state.bridge.fromChain.symbol,
                toChain: state.bridge.toChain.symbol,
                tokenSymbol: state.bridge.token.name
              }
            })
            return
          }
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.Approve,
              hash,
              message: 'Transaction failed',
              status: TransactionStatus.FAILED,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.name
            }
          })
        })
    } catch (error) {
      console.log('error happened in Approve', error)
    }
  }
  const handleDeposit = async () => {
    try {
      setErrorAmount(false)
      if (!account) {
        return
      }
      if (
        state.transaction.type === TransactionType.DEPOSIT &&
        state.transaction.status === TransactionStatus.PENDING
      ) {
        return
      }
      if (state.bridge.fromChain.id !== state.chainId) {
        setWrongNetwork(true)
        return
      }

      const Contract = makeContract(
        web3,
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.bridge.fromChain.id]
      )
      let hash = ''
      Contract.methods
        .deposit(
          state.bridge.nft.id,
          state.bridge.toChain.id,
          state.bridge.tokenId
        )
        .send({ from: state.account })
        .once('transactionHash', (tx) => {
          hash = tx
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.DEPOSIT,
              hash,
              message: 'Depositing transaction is pending',
              status: TransactionStatus.PENDING,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              amount: state.bridge.amount,
              tokenSymbol: state.bridge.token.name,
              nftName: state.bridge.nft.name,
              icon: state.bridge.nft.logo
            }
          })
        })
        .once('receipt', ({ transactionHash }) => {
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.DEPOSIT,
              hash: transactionHash,
              message: 'Transaction successful',
              status: TransactionStatus.SUCCESS,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              amount: state.bridge.amount,
              tokenSymbol: state.bridge.token.name,
              nftName: state.bridge.nft.name,
              icon: state.bridge.nft.logo
            }
          })
          setFetch(new Date().getTime())
          let tBalance = tokenBalance.split(' ')
          let balance = `${Number(tBalance[0]) - state.bridge.amount} ${
            tBalance[1]
          }`
          dispatch({
            type: 'SET_TOKEN_BALANCE',
            payload: balance
          })
          // setTokenBalance(balance)
        })
        .once('error', (error) => {
          if (!hash) {
            dispatch({
              type: 'UPDATE_TRANSACTION',
              payload: {
                type: TransactionType.DEPOSIT,
                message: 'Transaction rejected',
                status: TransactionStatus.FAILED,
                chainId: state.bridge.fromChain.id,
                fromChain: state.bridge.fromChain.symbol,
                toChain: state.bridge.toChain.symbol,
                amount: state.bridge.amount,
                tokenSymbol: state.bridge.token.name,
                nftName: state.bridge.nft.name,
                icon: state.bridge.nft.logo
              }
            })
            return
          }
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.DEPOSIT,
              hash,
              message: 'Transaction failed',
              status: TransactionStatus.FAILED,
              chainId: state.bridge.fromChain.id,
              fromChain: state.bridge.fromChain.symbol,
              toChain: state.bridge.toChain.symbol,
              amount: state.bridge.amount,
              tokenSymbol: state.bridge.token.name,
              nftName: state.bridge.nft.name,
              icon: state.bridge.nft.logo
            }
          })
        })
    } catch (error) {
      console.log('error happened in Deposit', error)
    }
  }

  const unsetProject = () => {
    updateBridge('project', '')
    updateBridge('nft', '')
    dispatch({
      type: 'UPDATE_ACTION_BUTTON_TYPE',
      payload: 'select'
    })
  }

  const handleClaim = async (claim) => {
    const fromChain = findChain(Number(claim.fromChain))
    const toChain = findChain(Number(claim.toChain))
    let hash = ''
    try {
      if (
        lock &&
        lock.fromChain === claim.fromChain &&
        lock.toChain === claim.toChain &&
        lock.txId === claim.txId
      ) {
        return
      }
      // const FromChainContract = makeContract(
      //   fromChain.web3,
      //   MuonNFTBridge_ABI,
      //   MuonNFTBridge[fromChain.id]
      // )
      // let mainTokenAddress = await FromChainContract.methods
      //   .tokens(claim.tokenId)
      //   .call()

      let Contract = makeContract(
        web3,
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.chainId]
      )

      const muonResponse = await muon
        .app('nft_bridge')
        .method('claim', {
          depositAddress: MuonNFTBridge[claim.fromChain],
          depositTxId: claim.txId,
          depositNetwork: fromChain.name.toLocaleLowerCase()
        })
        .call()
      if (!muonResponse.confirmed) {
        const errorMessage = muonResponse.error?.message
          ? muonResponse.error.message
          : muonResponse.error
          ? muonResponse.error
          : 'Muon response failed'
        dispatch({
          type: 'UPDATE_TRANSACTION',
          payload: {
            type: TransactionType.CLAIM,
            message: errorMessage,
            status: TransactionStatus.FAILED,
            chainId: toChain.id,
            toChain: toChain.symbol,
            tokenSymbol: claim.token.symbol
          }
        })
        setLoading(false)

        return
      }

      let { sigs, reqId } = muonResponse

      setLock(claim)

      Contract.methods
        .claim(
          account,
          claim.nftId,
          [claim.fromChain, claim.toChain, claim.tokenId, claim.txId],
          reqId,
          sigs
        )
        .send({ from: state.account })
        .once('transactionHash', (tx) => {
          hash = tx
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.CLAIM,
              hash,
              message: 'Claiming transaction is pending',
              status: TransactionStatus.PENDING,
              chainId: toChain.id,
              toChain: toChain.symbol,
              tokenSymbol: claim.token.symbol
            }
          })
        })
        .once('receipt', ({ transactionHash }) => {
          setLock('')
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.CLAIM,
              hash,
              message: 'Transaction successful',
              status: TransactionStatus.SUCCESS,
              chainId: toChain.id,
              toChain: toChain.symbol,
              tokenSymbol: claim.token.symbol
            }
          })
          setFetch(claim)
        })
        .once('error', (error) => {
          setLock('')
          if (!hash) {
            dispatch({
              type: 'UPDATE_TRANSACTION',
              payload: {
                type: TransactionType.CLAIM,
                hash,
                message: 'Transaction rejected',
                status: TransactionStatus.FAILED,
                chainId: toChain.id,
                toChain: toChain.symbol,
                tokenSymbol: claim.token.symbol
              }
            })
            return
          }
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.CLAIM,
              hash,
              message: 'Transaction failed',
              status: TransactionStatus.FAILED,
              chainId: toChain.id,
              toChain: toChain.symbol,
              tokenSymbol: claim.token.symbol
            }
          })
        })
    } catch (error) {
      console.log('error happened in Claim', error)
    }
  }

  const handleAddMainToken = async () => {
    try {
      let hash = ''
      if (
        state.transaction.type === TransactionType.GENERATE_MAIN_TOKEN &&
        state.transaction.status === TransactionStatus.PENDING
      ) {
        return
      }
      if (state.bridge.fromChain.id !== state.chainId) {
        setWrongNetwork(true)
        return
      }
      const Contract = makeContract(
        web3,
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.bridge.fromChain.id]
      )

      Contract.methods
        .addMainToken(state.bridge.token.address[state.bridge.fromChain.id])
        .send({ from: state.account })
        .once('transactionHash', (tx) => {
          hash = tx
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_MAIN_TOKEN,
              message: 'Transaction is pending',
              status: TransactionStatus.PENDING,
              hash,
              chainId: state.bridge.fromChain.id,
              toChain: state.bridge.fromChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
        })
        .once('receipt', async ({ transactionHash }) => {
          const tokenId = await Contract.methods
            .getTokenId(state.bridge.token.address[state.bridge.fromChain.id])
            .call()

          dispatch({
            type: 'FROM_CHAIN_TOKEN_ID',
            payload: tokenId
          })

          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_MAIN_TOKEN,
              message: 'Transaction successful',
              status: TransactionStatus.SUCCESS,
              hash: transactionHash,
              chainId: state.bridge.fromChain.id,
              toChain: state.bridge.fromChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
          dispatch({
            type: 'UPDATE_ACTION_BUTTON_TYPE',
            payload: 'select'
          })

          dispatch({
            type: 'UPDATE_FROM_CHAIN_TOKEN_EXIST',
            payload: true
          })
        })
        .once('error', (error) => {
          if (!hash) {
            dispatch({
              type: 'UPDATE_TRANSACTION',
              payload: {
                type: TransactionType.GENERATE_MAIN_TOKEN,
                message: 'Transaction rejected',
                status: TransactionStatus.FAILED,
                chainId: state.bridge.fromChain.id,
                toChain: state.bridge.fromChain.symbol,
                tokenSymbol: state.bridge.token.symbol
              }
            })
            return
          }
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_MAIN_TOKEN,
              message: 'Transaction failed',
              status: TransactionStatus.FAILED,
              hash,
              chainId: state.bridge.fromChain.id,
              toChain: state.bridge.fromChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
        })
    } catch (error) {
      console.log('error happened in add Main Token', error)
    }
  }

  const handleAddBridgeToken = async () => {
    try {
      if (state.bridge.toChain.id !== state.chainId) {
        setWrongNetwork(true)
        return
      }
      if (
        state.transaction.type === TransactionType.GENERATE_BRIDGE_TOKEN &&
        state.transaction.status === TransactionStatus.PENDING
      ) {
        return
      }
      setLoading(true)

      let hash = ''
      const muonResponse = await muon
        .app('nft_bridge')
        .method('addBridgeToken', {
          mainTokenAddress:
            state.bridge.token.address[state.bridge.fromChain.id],
          mainNetwork: state.bridge.fromChain.id
        })
        .call()
      if (!muonResponse.confirmed) {
        const errorMessage = muonResponse.error?.message
          ? muonResponse.error.message
          : muonResponse.error
          ? muonResponse.error
          : 'Muon response failed'
        dispatch({
          type: 'UPDATE_TRANSACTION',
          payload: {
            type: TransactionType.GENERATE_BRIDGE_TOKEN,
            message: errorMessage,
            status: TransactionStatus.FAILED,
            chainId: state.bridge.toChain.id,
            toChain: state.bridge.toChain.symbol,
            tokenSymbol: state.bridge.token.symbol
          }
        })
        setLoading(false)

        return
      }

      let {
        data: {
          result: { token, tokenId, sourceChain }
        },
        sigs,
        reqId
      } = muonResponse

      const ToChainContract = makeContract(
        web3,
        MuonNFTBridge_ABI,
        MuonNFTBridge[state.bridge.toChain.id]
      )
      setLoading(false)
      ToChainContract.methods
        .addBridgeToken(
          [tokenId, sourceChain],
          token.name,
          token.symbol,
          reqId,
          sigs
        )
        .send({ from: state.account })
        .once('transactionHash', (tx) => {
          hash = tx
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_BRIDGE_TOKEN,
              message: 'Transaction is pending',
              status: TransactionStatus.PENDING,
              hash,
              chainId: state.bridge.toChain.id,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
        })
        .once('receipt', async ({ transactionHash }) => {
          let address = await ToChainContract.methods
            .tokens(state.bridge.tokenId)
            .call()
          let selectedToken = {
            ...state.bridge.token,
            address: {
              ...state.bridge.token.address,
              [state.bridge.toChain.id]: address
            }
          }
          dispatch({
            type: 'UPDATE_BRIDGE',
            payload: {
              field: 'token',
              value: selectedToken
            }
          })
          addTokenToLocalstorage(
            { ...state.bridge.token, address },
            NFT,
            state.bridge.toChain
          )
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_BRIDGE_TOKEN,
              message: 'Transaction successful',
              status: TransactionStatus.SUCCESS,
              hash: transactionHash,
              chainId: state.bridge.toChain.id,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
          dispatch({
            type: 'UPDATE_TO_CHAIN_TOKEN_EXIST',
            payload: true
          })
          dispatch({
            type: 'UPDATE_ACTION_BUTTON_TYPE',
            payload: 'select'
          })
        })
        .once('error', (error) => {
          if (!hash) {
            dispatch({
              type: 'UPDATE_TRANSACTION',
              payload: {
                type: TransactionType.GENERATE_BRIDGE_TOKEN,
                message: 'Transaction rejected',
                status: TransactionStatus.FAILED,
                chainId: state.bridge.toChain.id,
                toChain: state.bridge.toChain.symbol,
                tokenSymbol: state.bridge.token.symbol
              }
            })
            return
          }
          dispatch({
            type: 'UPDATE_TRANSACTION',
            payload: {
              type: TransactionType.GENERATE_BRIDGE_TOKEN,
              message: 'Transaction failed',
              status: TransactionStatus.FAILED,
              hash,
              chainId: state.bridge.toChain.id,
              toChain: state.bridge.toChain.symbol,
              tokenSymbol: state.bridge.token.symbol
            }
          })
        })
    } catch (error) {
      console.log('error happened in add bridge Token', error)
    }
  }

  return (
    <>
      <Head>
        <title>Muon NFT Bridge</title>
      </Head>
      <TabContainer>
        <Tab active={active === 'bridge'} onClick={() => setActive('bridge')}>
          <Type.SM fontSize="15px">NFT Bridge</Type.SM>
        </Tab>
        {claims.length > 0 && (
          <Tab active={active === 'claim'} onClick={() => setActive('claim')}>
            <Type.SM fontSize="15px" position="relative">
              Claim Token
              <Badge>{claims.length}</Badge>
            </Type.SM>
          </Tab>
        )}
      </TabContainer>
      <Wrapper>
        <BoxWrapper maxWidth="340px" width="100%"></BoxWrapper>

        <DepositWrapper maxWidth="470px" width="100%" active={active}>
          <Deposit
            handleDeposit={handleDeposit}
            wrongNetwork={wrongNetwork}
            destChains={destChains}
            // tokenBalance={tokenBalance}
            unsetProject={unsetProject}
            updateBridge={updateBridge}
            handleConnectWallet={handleConnectWallet}
            handleApprove={handleApprove}
            handleAddBridgeToken={handleAddBridgeToken}
            handleAddMainToken={handleAddMainToken}
            errorAmount={errorAmount}
            loading={loading}
          />
        </DepositWrapper>
        <BoxWrapper maxWidth="340px" width="100%">
          {state.transaction.status && <CustomTransaction />}
          <ClaimWrapper maxWidth="340px" width="100%" active={active}>
            {claims.length > 0 && (
              <ClaimToken
                claims={claims}
                handleClaim={(claim) => handleClaim(claim)}
                lock={lock}
              />
            )}
          </ClaimWrapper>
        </BoxWrapper>
      </Wrapper>
      <WalletModal
        open={open}
        hide={() => {
          setOpen(!open)
        }}
      />
    </>
  )
}
export default HomePage
