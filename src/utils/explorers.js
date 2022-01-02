import { ChainMap } from '../constants/chainsMap'
import { LinkType } from '../constants/transactionStatus'

const EXPLORER_PREFIXES = {
  [ChainMap.MAINNET]: 'https://etherscan.io', //  ETH
  [ChainMap.ROPSTEN]: 'https://ropsten.etherscan.io', //  Ropsten
  [ChainMap.RINKEBY]: 'https://rinkeby.etherscan.io', //  Rinkeby
  [ChainMap.BSC]: 'https://bscscan.com', //  BSC
  [ChainMap.BSC_TESTNET]: 'https://testnet.bscscan.com', //  BSC TEST
  [ChainMap.MATIC]: 'https://polygonscan.com', //  POLYGON
  [ChainMap.MATIC_TESTNET]: 'https://mumbai.polygonscan.com', //  Mumbai
  [ChainMap.XDAI]: 'https://blockscout.com/xdai/mainnet', //  xDAI
  [ChainMap.FANTOM]: 'https://ftmscan.com', //  FTM
  [ChainMap.FANTOM_TESTNET]: 'https://testnet.ftmscan.com', //  FTM TEST
  [ChainMap.HECO]: 'https://hecoinfo.com', //  HECO
  [ChainMap.HECO_TESTNET]: 'https://testnet.hecoinfo.com', //  HECOT
  [ChainMap.AVAX]: 'https://snowtrace.io' //  AVAX
}

export const getTransactionLink = (chainId, data, type) => {
  const prefix = `${EXPLORER_PREFIXES[chainId]}`

  switch (type) {
    case LinkType.Transaction: {
      return `${prefix}/tx/${data}`
    }
    case LinkType.TOKEN: {
      return `${prefix}/token/${data}`
    }
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
