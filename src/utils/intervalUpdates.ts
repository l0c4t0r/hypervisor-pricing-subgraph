import { BigInt } from '@graphprotocol/graph-ts'
import { Hypervisor, HypervisorDayData } from '../../generated/schema'
import { ZERO_BI, ZERO_BD } from './constants'

let SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24)

export function updateHypervisorDayData(hypervisorAddress: string, timestamp: BigInt): void {

    let dayNumber = timestamp  / SECONDS_IN_DAY
    let dayStartTimestamp = dayNumber * SECONDS_IN_DAY

    let hypervisor = Hypervisor.load(hypervisorAddress)

    let dayHypervisorId = hypervisorAddress + '-' + dayNumber.toString()
    let hypervisorDayData = HypervisorDayData.load(dayHypervisorId)
    if (hypervisorDayData === null) {
        hypervisorDayData = new HypervisorDayData(dayHypervisorId)
        hypervisorDayData.date = dayStartTimestamp
        hypervisorDayData.hypervisor = hypervisorAddress
        hypervisor.totalSupply = ZERO_BI
        hypervisorDayData.tvl0 = ZERO_BI
        hypervisorDayData.tvl1 = ZERO_BI
        hypervisorDayData.tvlUSD = ZERO_BD
        hypervisorDayData.open = hypervisor.pricePerShare
        hypervisorDayData.close = hypervisor.pricePerShare
        hypervisorDayData.low = hypervisor.pricePerShare
        hypervisorDayData.high = hypervisor.pricePerShare
    }

    hypervisorDayData.totalSupply = hypervisor.totalSupply
    hypervisorDayData.tvl0 = hypervisor.tvl0
    hypervisorDayData.tvl1 = hypervisor.tvl1
    hypervisorDayData.tvlUSD = hypervisor.tvlUSD

    hypervisorDayData.close = hypervisor.pricePerShare

    if (hypervisor.pricePerShare > hypervisorDayData.high) {
        hypervisorDayData.high = hypervisor.pricePerShare
    } else if (hypervisor.pricePerShare < hypervisorDayData.low) {
        hypervisorDayData.low = hypervisor.pricePerShare
    }

    hypervisorDayData.save()
}