import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { FrameConnector } from '@web3-react/frame-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { ChainMap } from '../constants/chainsMap'

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY

const supportedChainIds = Object.values(ChainMap)

const RPC_URLS = {
  [ChainMap.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [ChainMap.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [ChainMap.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [ChainMap.BSC]: 'https://bsc-dataseed1.binance.org',
  [ChainMap.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  [ChainMap.MATIC]: 'https://rpc-mainnet.maticvigil.com/',
  [ChainMap.MATIC_TESTNET]: 'https://rpc-mumbai.maticvigil.com/',
  [ChainMap.XDAI]: 'https://rpc.xdaichain.com',
  [ChainMap.FANTOM]: 'https://rpcapi.fantom.network',
  [ChainMap.FANTOM_TESTNET]: 'https://rpc.testnet.fantom.network/',
  [ChainMap.HECO]: 'https://http-mainnet-node.huobichain.com',
  [ChainMap.HECO_TESTNET]: 'https://http-testnet.hecochain.com',
  [ChainMap.AVAX]: 'https://api.avax.network/ext/bc/C/rpc'
}

export const injected = new InjectedConnector({ supportedChainIds })

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 2000
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'mrc20-presale'
})

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.NEXT_PUBLIC_FORTMATIC_KEY,
  chainId: 1
})

export const frame = new FrameConnector({ supportedChainIds: [1] })

export const ConnectorNames = {
  Injected: 'MetaMask',
  Network: 'Network',
  WalletConnect: 'WalletConnect',
  WalletLink: 'WalletLink',
  Ledger: 'Ledger',
  Trezor: 'Trezor',
  Lattice: 'Lattice',
  Frame: 'Frame',
  Fortmatic: 'Fortmatic'
}

export const ConnectorByName = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.WalletLink]: walletlink
  // [ConnectorNames.Frame]: frame,
  // [ConnectorNames.Fortmatic]: fortmatic
}
