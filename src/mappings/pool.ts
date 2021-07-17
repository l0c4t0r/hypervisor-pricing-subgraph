import { log, Address } from '@graphprotocol/graph-ts'
import { Swap } from "../../generated/templates/UniswapV3Pool/UniswapV3Pool"
import { updateState } from "../utils/StateUpdate"
import { updateHypervisorDayData } from "../utils/intervalUpdates"
import { Pool } from "../../generated/schema"
import { ZERO_BI } from "../utils/constants"

export function handleSwap(event: Swap): void {
	let pool = Pool.load(event.address.toHex())
	pool.lastSwapTime = event.block.timestamp
	pool.save()

	pool.hypervisors.forEach(hypervisorId => {
		updateState(Address.fromString(hypervisorId))
		updateHypervisorDayData(hypervisorId)
	})
}