const http = require('./Http')
const config = require('../config.json');
const DBService = require('./DBService.js');
const periodDuration = config.periodDuration;
const numberOfPeriods = config.numberOfPeriods;


class Statistic {
    constructor() {
        DBService.getDataSet()
            .then(data => {
                this.blockDataSet = data;
                console.log('Current data-set', this.blockDataSet);
            })
            .catch(err => {console.error(err); this.blockDataSet = []});
        
    }

    fetchNewSetOfBlocks = async blockHeight => {
        try {
            const blockList = await http.getBlocksFromHeightWithLimit(periodDuration, blockHeight);
            if(blockList) {
                const averageBlockInfo = makeAverageBlockInfo(blockList)
                if( 
                    this.blockDataSet &&
                    this.blockDataSet[this.blockDataSet.length - 1] &&
                    averageBlockInfo.timestamp - this.blockDataSet[this.blockDataSet.length - 1].timestamp < periodDuration
                )
                    return 0;
                this.blockDataSet.push(averageBlockInfo);
                if(this.blockDataSet.length > numberOfPeriods)
                    this.blockDataSet.shift();
                DBService.saveDataSet(this.blockDataSet);
                console.log('Added new data-set', this.blockDataSet, this.blockDataSet.length);
            }
        }
        catch(e) {
            console.log('Failed to fetch blockInfo list', e)
        }
    }

    getAllStatistics = () => [ ...this.blockDataSet ]
}



const makeAverageBlockInfo = blockList => {
    if(typeof blockList !== 'object')
        return { error: 'Failed to make average block info' }
    let averageBlockInfo = {};
    const difficultyList = blockList.map(_ => _.difficulty);
    const maxDifficulty = Math.max.apply(null, difficultyList);
    const minDifficulty = Math.min.apply(null, difficultyList);
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
        totalFee: averageBlockInfo.totalFee,
        avgTotalFee: averageBlockInfo.totalFee / blockList.length,
        avgDifficulty: averageBlockInfo.difficulty / blockList.length,
        maxDifficulty,
        minDifficulty,
        feeMultiplier: averageBlockInfo.feeMultiplier,
        avgFeeMultiplier: averageBlockInfo.feeMultiplier / blockList.length,
        numTransactions: averageBlockInfo.numTransactions,
        avgNumTransaction:  averageBlockInfo.numTransactions / blockList.length
    }
}
 

module.exports = new Statistic();