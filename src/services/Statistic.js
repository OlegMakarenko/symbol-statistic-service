const http = require('./Http')
const config = require('../config.json');
const periodDuration = config.periodDuration;
const numberOfPeriods = config.numberOfPeriods;

var blockDataSet = [];

const fetchNewSetOfBlocks = async blockHeight => {
    const blockList = await http.getBlocksFromHeightWithLimit(periodDuration, blockHeight);
    if(blockList) {
        
        const averageBlockInfo = makeAverageBlockInfo(blockList)
        
        blockDataSet.push(averageBlockInfo);
        if(blockDataSet.length > numberOfPeriods)
            blockDataSet.shift();
        console.log(blockDataSet, blockDataSet.length);
    }
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
 

module.exports = {
    fetchNewSetOfBlocks
}