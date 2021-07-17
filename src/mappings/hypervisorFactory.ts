import { log, Address } from '@graphprotocol/graph-ts'
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
	hypervisor.lastUpdated = event.block.timestamp
	hypervisor.save()

	let token0Address = hypervisorContract.token0()
	let token1Address = hypervisorContract.token1()

	let pool = Pool.load(hypervisor.pool)
	if (pool == null) {
		pool = new Pool(hypervisor.pool)
		pool.hypervisors = []
		pool.token0 = token0Address.toHex()
	    pool.token1 = token1Address.toHex()
	    pool.fee = hypervisorContract.fee()
	    pool.lastSwapTime = ZERO_BI
	}

	// Update hypervisors linked to pool
	let hypervisors = pool.hypervisors
	hypervisors.push(hypervisorId)
	pool.hypervisors = hypervisors
	pool.save()

	let token0 = getOrCreateToken(token0Address)
	let token1 = getOrCreateToken(token1Address)
	token0.save()
	token1.save()

	PoolTemplate.create(poolAddress)
}
