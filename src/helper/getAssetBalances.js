import { ERC20_ABI } from '../constants/ABI'
import multicall from './multicall'
import { getBalanceNumber } from '../helper/formatBalance'

const getAssetBalances = async (chains, tokens, account, web3) => {
  for (let index = 0; index < chains.length; index++) {
    const chain = chains[index]
    const calls = tokens
      .filter((item) => item.address[chain.id])
      .map((token) => {
        return {
          address: token.address[chain.id],
          name: 'balanceOf',
          params: [account]
        }
      })

    const result = await multicall(web3, ERC20_ABI, calls, chain.id)
    if (result && result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        const balance = result[i]
        const address = calls[i].address

        let token = tokens.find((token) => token.address[chain.id] === address)
        // token.balances[chain.id] = getBalanceNumber(
        //   balance,
        //   tokens[address]?.decimals
        // )
      }
    }
  }
  return tokens
}

export default getAssetBalances
