import { Address } from '@graphprotocol/graph-ts'
import { ERC20 } from "../../generated/UniswapV3HypervisorFactory/ERC20"
import { Token } from "../../generated/schema"
import { WETH_ADDRESS, DEFAULT_DECIMAL } from "./constants"


export function getOrCreateToken(tokenAddress: string): Token {

  let token = Token.load(tokenAddress)
  if (token == null) {
    token = new Token(tokenAddress)
    let contract = ERC20.bind(Address.fromString(tokenAddress))

    let tokenDecimals = contract.try_decimals();
    let tokenName = contract.try_name();
    let tokenSymbol = contract.try_symbol();

    token.decimals = !tokenDecimals.reverted ? tokenDecimals.value : DEFAULT_DECIMAL;
    token.name = !tokenName.reverted ? tokenName.value : '';
    token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : '';
  }
  token.save()

  return token as Token
}

export function isWETH(tokenAddress: Address): boolean {

  if (tokenAddress == Address.fromString(WETH_ADDRESS)){
    return true
  } else {
    return false
  }
}
