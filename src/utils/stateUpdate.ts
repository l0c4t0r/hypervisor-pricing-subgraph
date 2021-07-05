import { Address } from '@graphprotocol/graph-ts'
import { UniswapV3Hypervisor as HypervisorContract } from "../../generated/UniswapV3HypervisorFactory/UniswapV3Hypervisor"
import { Pool, Hypervisor } from "../../generated/schema"
import { getExchangeRate, getEthRateInUSD } from "./pricing"
import { ZERO_BI, ZERO_BD } from "./constants"
import { isWETH } from './tokens'


export function updateState(hypervisorAddress: Address): void {
	let contract = HypervisorContract.bind(hypervisorAddress)
	let totalAmounts = contract.getTotalAmounts()
	let hypervisor = Hypervisor.load(hypervisorAddress.toHex())
	
	hypervisor.tvl0 = totalAmounts.value0
	hypervisor.tvl1 = totalAmounts.value1

	let pool = Pool.load(hypervisor.pool)
	let prices = getExchangeRate(Address.fromString(hypervisor.pool))
	let ethRate = getEthRateInUSD()

	if (isWETH(Address.fromString(pool.token0))) {
		// If token0 is WETH, then we use need price0 to convert token1 to ETH
		hypervisor.tvlUSD = (hypervisor.tvl1.toBigDecimal() * prices[0] + hypervisor.tvl0.toBigDecimal()) * ethRate
	} else if (isWETH(Address.fromString(pool.token1))) {
		// If token1 is WETH, then we use need price1 to convert token0 to ETH
		hypervisor.tvlUSD = (hypervisor.tvl0.toBigDecimal() * prices[1] + hypervisor.tvl1.toBigDecimal()) * ethRate
	} else {
		// If neither token is WETH, don't track USD
		hypervisor.tvlUSD = ZERO_BD
	}

	hypervisor.totalSupply = contract.totalSupply()

	if (hypervisor.totalSupply > ZERO_BI) {
		hypervisor.pricePerShare = hypervisor.tvlUSD / hypervisor.totalSupply.toBigDecimal()
	}

	hypervisor.save()
}