import {
  ERC20_FUN,
  ERC20_FUN_MAP,
  ERC721_FUN,
  ERC721_FUN_MAP
} from '../constants/misc'
import multicall from './multicall'

import { ERC20_ABI, ERC721_ABI } from '../constants/ABI'
import { isAddress, makeContract } from '.'
import { AddressZero } from '@ethersproject/constants'
import { getBalanceNumber } from './formatBalance'
import { escapeRegExp } from '../utils/utils'

export const getToken = async (address, account, fromChain, web3) => {
  try {
    console.log({ address, account, fromChain, web3 })
    let token = ''
    if (!isAddress(address) || address === AddressZero) {
      throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    const calls = Object.keys(ERC20_FUN).map((methodName) => {
      if (ERC20_FUN[methodName] === 'balanceOf')
        return {
          address: address,
          name: ERC20_FUN[methodName],
          params: [account]
        }
      else {
        return {
          address: address,
          name: ERC20_FUN[methodName]
        }
      }
    })
    const result = await multicall(web3, ERC20_ABI, calls, fromChain.id)
    if (result && result.length > 0) {
      token = {
        symbol: result[ERC20_FUN_MAP.symbol][0],
        name: result[ERC20_FUN_MAP.name][0],
        tokens: {
          [fromChain.id]: getBalanceNumber(
            result[ERC20_FUN_MAP.balanceOf],
            result[ERC20_FUN_MAP.decimals][0]
          )
        },
        address: {
          [fromChain.id]: address
        }
      }
    }
    return token
  } catch (error) {}
}

export const getNFT = async (address, account, chain, web3) => {
  console.log({ address, account, chain, web3 })
  try {
    let token = ''
    if (!isAddress(address) || address === AddressZero) {
      throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    const calls = [
      {
        address: address,
        name: 'symbol'
      },
      {
        address: address,
        name: 'name'
      }
      // {
      //   address: address,
      //   name: 'tokenURI',
      //   params: [Number(nftId)]
      // }
    ]

    const result = await multicall(web3, ERC721_ABI, calls, chain.id)

    console.log('result ', result)
    if (result && result.length > 0) {
      token = {
        symbol: result[0][0],
        name: result[1][0],
        address: {
          [chain.id]: address
        }
      }
    }
    return token
  } catch (error) {
    console.log(error)
  }
}

// TODO complete this function and catch error localstorage safari
export const findAndAddToken = async (
  searchQuery,
  tokens,
  account,
  fromChain,
  web3
) => {
  // Step 1: search in token list
  let finalTokens = [...tokens]
  let token = ''
  const search = new RegExp([escapeRegExp(searchQuery)].join(''), 'i')

  let customTokens = JSON.parse(localStorage.getItem('tokens'))

  let resultFilter = finalTokens.filter((item) => {
    console.log('item', item)
    return (
      search.test(item.name) ||
      search.test(item.symbol) ||
      item.address[fromChain.id]?.toLowerCase() === searchQuery.toLowerCase()
      // Object.values(item.address).indexOf(searchQuery) > -1 //address should be exactly the same
    )
  })
  if (resultFilter.length === 0 && isAddress(searchQuery)) {
    // step 2: check ERC721 and Add to  localStorage
    console.log(searchQuery, account, fromChain)
    token = await getNFT(searchQuery, account, fromChain, web3)
    console.log(token)

    if (token) {
      token = { id: searchQuery, ...token }
      if (!customTokens) {
        localStorage.setItem('tokens', JSON.stringify([token]))
      } else {
        const index = customTokens.findIndex(
          (item) => item.name === token.name && item.symbol === token.symbol
        )
        if (index !== -1) {
          customTokens.splice(index, 1, {
            ...customTokens[index],
            address: {
              ...customTokens[index].address,
              [fromChain.id]: searchQuery
            },
            balances: { ...customTokens[index].balances, ...token.balances }
          })
        } else {
          customTokens = [...customTokens, token]
        }

        localStorage.setItem('tokens', JSON.stringify(customTokens))
      }
      resultFilter.push(token)
    }
  }
  return { resultFilter, token }
}

export const addTokenToLocalstorage = async (token, tokens, chain) => {
  // Step 1: search in token list
  let finalTokens = [...tokens]
  const search = new RegExp([escapeRegExp(token.address)].join(''), 'i')

  let customTokens = JSON.parse(localStorage.getItem('tokens'))

  let resultFilter = finalTokens.filter((item) => {
    console.log('item', item)
    return (
      search.test(item.name) ||
      search.test(item.symbol) ||
      item.address[chain.id]?.toLowerCase() === token.address.toLowerCase()
      // Object.values(item.address).indexOf(tokenAddress) > -1 //address should be exactly the same
    )
  })
  if (resultFilter.length === 0 && isAddress(token.address)) {
    // step 2:  Add to  localStorage

    if (token) {
      token = { id: token.address, ...token }
      if (!customTokens) {
        localStorage.setItem('tokens', JSON.stringify([token]))
      } else {
        const index = customTokens.findIndex(
          (item) => item.name === token.name && item.symbol === token.symbol
        )
        if (index !== -1) {
          customTokens.splice(index, 1, {
            ...customTokens[index],
            address: {
              ...customTokens[index].address,
              [chain.id]: token.address
            }
          })
        } else {
          customTokens = [...customTokens, token]
        }

        localStorage.setItem('tokens', JSON.stringify(customTokens))
      }
    }
  }
}
