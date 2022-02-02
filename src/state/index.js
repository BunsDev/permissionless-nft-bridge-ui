import { NFT } from '../constants/settings'

export const initState = {
  account: '',
  chainId: '',
  network: 'NaN',
  tokens: NFT,
  showTokens: NFT,
  fromChainTokenExit: true,
  toChainTokenExit: true,
  approve: false,
  owner: false,
  actionBtnType: 'select',
  tokenBalance: '0',
  bridge: {
    fromChain: '',
    toChain: '',
    token: '',
    nft: ''
  },
  tokenSearchQuery: '',
  transaction: {
    type: '',
    message: '',
    status: '',
    icon: '',
    fromChain: '',
    toChain: ''
  },
  selectedAsset: ''
}

export const reducer = (state, action) => {
  let newState
  switch (action.type) {
    case 'UPDATE_NETWORK_INFO':
      newState = {
        ...state,
        account: action.payload.account,
        chainId: action.payload.chainId,
        network: action.payload.network
      }
      break

    case 'UPDATE_TOKENS':
      newState = {
        ...state,
        tokens: action.payload,
        showTokens: action.payload
      }
      break

    case 'UPDATE_NFT':
      //TODO removed {}...action.payload}
      newState = {
        ...state,
        bridge: {
          ...state.bridge,
          nft: { ...state.bridge.nft, logo: action.payload.image || null }
        }
      }
      break

    case 'UPDATE_NFT_ID':
      const ids = action.payload.split(/[ ,]/)
      const uniqueId = Array.from(new Set(ids.filter((id) => id !== '')))
      let nft = ''
      if(uniqueId.length > 0)
      {
        nft = { id: uniqueId }
      }
      newState = {
        ...state,
        bridge: { ...state.bridge, nft: nft }
      }
      break

    case 'ADD_NEW_TOKEN':
      newState = { ...state, tokens: [...state.tokens, action.payload] }
      break

    case 'ADD_NEW_TOKENS':
      newState = { ...state, tokens: [...state.tokens, ...action.payload] }
      break

    case 'UPDATE_SHOW_TOKENS':
      newState = { ...state, showTokens: action.payload }
      break

    case 'UPDATE_ACTION_BUTTON_TYPE':
      newState = { ...state, actionBtnType: action.payload }
      break

    case 'UPDATE_FROM_CHAIN_TOKEN_EXIST':
      newState = { ...state, fromChainTokenExit: action.payload }
      break

    case 'UPDATE_TO_CHAIN_TOKEN_EXIST':
      newState = { ...state, toChainTokenExit: action.payload }
      break

    case 'FROM_CHAIN_TOKEN_ID':
      newState = {
        ...state,
        bridge: { ...state.bridge, tokenId: action.payload }
      }
      break

    case 'UPDATE_BRIDGE':
      newState = {
        ...state,
        bridge: {
          ...state.bridge,
          [action.payload.field]: action.payload.value
        }
      }
      break

    case 'UPDATE_BRIDGE_FROMCHAIN':
      newState = {
        ...state,
        bridge: {
          ...state.bridge,
          toChain: '',
          token: '',
          nft: '',
          [action.payload.field]: action.payload.value
        }
      }
      break

    case 'UPDATE_TOKEN_SEARCH_QUERY':
      newState = {
        ...state,
        tokenSearchQuery: action.payload
      }
      break

    case 'UPDATE_TRANSACTION':
      newState = {
        ...state,
        transaction: {
          ...action.payload
        }
      }
      break

    case 'UPDATE_APPROVE':
      newState = { ...state, approve: action.payload }
      break

    case 'UPDATE_OWNER':
      newState = { ...state, owner: action.payload }
      break

    case 'UPDATE_WRONG_ID':
      newState = { ...state, error: action.payload }
      break

    case 'SET_TOKEN_BALANCE':
      newState = { ...state, tokenBalance: action.payload }
      break

    case 'CLEAN_DATA':
      newState = {
        ...state,
        actionBtnType: 'select',
        bridge: {
          tokenId: '',
          fromChain: '',
          toChain: '',
          token: '',
          nft: ''
        },
        transaction: {
          type: '',
          message: '',
          status: '',
          icon: '',
          fromChain: '',
          toChain: ''
        }
      }
      break
    case 'UPDATE_SELECTED_ASSET':
      newState = { ...state, selectedAsset: action.payload }
      break
    default:
      throw new Error(`${action.type} is not defined in this state!`)
      break
  }
  return newState
}
