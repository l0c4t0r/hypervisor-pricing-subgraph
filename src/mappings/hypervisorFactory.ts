import { Address } from '@graphprotocol/graph-ts'
import { HypervisorCreated } from "../../generated/UniswapV3HypervisorFactory/UniswapV3HypervisorFactory"
import { UniswapV3Hypervisor as HypervisorContract } from "../../generated/UniswapV3HypervisorFactory/UniswapV3Hypervisor"
import { UniswapV3Pool as PoolContract } from "../../generated/UniswapV3HypervisorFactory/UniswapV3Pool"
import { UniswapV3Pool as PoolTemplate } from "../../generated/templates"
import { Pool, Hypervisor } from "../../generated/schema"
import { getOrCreateToken } from "../utils/tokens"
import { ZERO_BI, ZERO_BD } from "../utils/constants"

//Hypervisors that were created with invalid parameters and should not be indexed
let INVALID_HYPERVISORS: Array<Address> = [
    Address.fromString("0xce721b5dc9624548188b5451bb95989a7927080a"),  // CRV
    Address.fromString("0x0e9e16f6291ba2aaaf41ccffdf19d32ab3691d15")   // MATIC
]

export function handleHypervisorCreated(event: HypervisorCreated): void {

	if (INVALID_HYPERVISORS.includes(event.params.hypervisor)) return;

	let hypervisorContract = HypervisorContract.bind(event.params.hypervisor)
	let hypervisorId = event.params.hypervisor.toHex()

	let hypervisor = new Hypervisor(hypervisorId)
	let poolAddress = hypervisorContract.pool()
	hypervisor.pool = poolAddress.toHex()
	hypervisor.totalSupply = hypervisorContract.totalSupply()
	hypervisor.tvl0 = ZERO_BI
	hypervisor.tvl1 = ZERO_BI
	hypervisor.tvlUSD = ZERO_BD
	hypervisor.pricePerShare = ZERO_BD
	hypervisor.save()

	let pool = Pool.load(hypervisor.pool)
	if (pool == null) {
		pool = new Pool(hypervisor.pool)
		pool.hypervisor = hypervisorId
		pool.token0 = hypervisorContract.token0().toHex()
	    pool.token1 = hypervisorContract.token1().toHex()
	    pool.fee = hypervisorContract.fee()
	}
	pool.save()

	let token0 = getOrCreateToken(pool.token0)
	let token1 = getOrCreateToken(pool.token1)

	PoolTemplate.create(poolAddress)
}
