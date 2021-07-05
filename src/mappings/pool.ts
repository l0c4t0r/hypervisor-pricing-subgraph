import { Address } from '@graphprotocol/graph-ts'
import { Swap } from "../../generated/templates/UniswapV3Pool/UniswapV3Pool"
import { UniswapV3Hypervisor as HypervisorContract } from "../../generated/templates/UniswapV3Pool/UniswapV3Hypervisor"
import { updateState } from "../utils/StateUpdate"
import { updateHypervisorDayData } from "../utils/intervalUpdates"
import { Pool, Hypervisor } from "../../generated/schema"

export function handleSwap(event: Swap): void {
	let pool = Pool.load(event.address.toHex())
	updateState(Address.fromString(pool.hypervisor))
	updateHypervisorDayData(pool.hypervisor, event.block.timestamp)
}