const http = require('./Http')
const config = require('../config.json');
const periodDuration = config.periodDuration;
const numberOfPeriods = config.numberOfPeriods;


class Statistic {
    constructor() {
        this.blockDataSet = [];
    }

    fetchNewSetOfBlocks = async blockHeight => {
        const blockList = await http.getBlocksFromHeightWithLimit(periodDuration, blockHeight);
        if(blockList) {
            
            const averageBlockInfo = makeAverageBlockInfo(blockList)
            
            this.blockDataSet.push(averageBlockInfo);
            if(this.blockDataSet.length > numberOfPeriods)
                this.blockDataSet.shift();
            console.log(this.blockDataSet, this.blockDataSet.length);
        }
    }

    getAllStatistics = () => [ ...this.blockDataSet ]
}



const makeAverageBlockInfo = blockList => {
    let averageBlockInfo = {};
    blockList.forEach((blockInfo) => 
        averageBlockInfo = {
            height: blockInfo.height,
            timestamp: blockInfo.timestamp,
            totalFee: +blockInfo.totalFee + (averageBlockInfo.totalFee || 0),
            difficulty: +blockInfo.difficulty + (averageBlockInfo.difficulty || 0),
            feeMultiplier: +blockInfo.feeMultiplier + (averageBlockInfo.feeMultiplier || 0),
            numTransactions: +blockInfo.numTransactions + (averageBlockInfo.numTransactions || 0)
    })

    return {
        height: averageBlockInfo.height,
        timestamp: averageBlockInfo.timestamp,
        totalFee: averageBlockInfo.totalFee / blockList.length,
        difficulty: averageBlockInfo.difficulty / blockList.length,
        feeMultiplier: averageBlockInfo.feeMultiplier / blockList.length,
        numTransactions: averageBlockInfo.numTransactions / blockList.length
    }
}
 

module.exports = new Statistic();