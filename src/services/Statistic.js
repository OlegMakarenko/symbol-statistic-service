const http = require('./Http')
const config = require('../config.json');
const DBService = require('./DBService.js');
const periodDuration = config.periodDuration;
const numberOfPeriods = config.numberOfPeriods;
const blockGenerationTargetTime = config.blockGenerationTargetTime;


class Statistic {
    constructor() {
        DBService.getDataSet()
            .then(data => {
                this.blockDataSet = data;
                console.log('Current data-set', this.blockDataSet.length);
            })
            .catch(err => {console.error(err); this.blockDataSet = []});
        
    }

    get lastPeriodTimestamp() {
        if( 
            this.blockDataSet &&
            this.blockDataSet[this.blockDataSet.length - 1] &&
            this.blockDataSet[this.blockDataSet.length - 1].timestamp
        )
        return this.blockDataSet[this.blockDataSet.length - 1].timestamp;
        else return 0;
    }

    fetchNewSetOfBlocks = async blockHeight => {
       /// try {
            let blocksCountToFetch = Math.round(periodDuration / blockGenerationTargetTime);

            if(this.blockDataSet && this.blockDataSet[this.blockDataSet.length - 1]){
                blocksCountToFetch = blockHeight - this.blockDataSet[this.blockDataSet.length - 1].height;
                console.log(blockHeight - this.blockDataSet[this.blockDataSet.length - 1].height,
                    blockHeight, this.blockDataSet[this.blockDataSet.length - 1].height)
            }

            const blockList = await http.getBlocksFromHeightWithLimit(blocksCountToFetch, blockHeight);

            if(blockList) {
                const averageBlockInfo = makeAverageBlockInfo(blockList);
                console.log('Statistics received data-set of ', blockList.length + ' elements')
                console.log()
                if( 
                    this.blockDataSet &&
                    this.blockDataSet[this.blockDataSet.length - 1] &&
                    averageBlockInfo.timestamp - this.blockDataSet[this.blockDataSet.length - 1].timestamp < periodDuration
                ){
                    throw Error(
                        '>>Inavlid period' + 
                        ' | current time_s: ' + averageBlockInfo.timestamp +
                        ' | last time_s: ' + this.blockDataSet[this.blockDataSet.length - 1].timestamp +
                        ' | expected-period: ' + periodDuration +
                        ' | current-period: ' + (averageBlockInfo.timestamp - this.blockDataSet[this.blockDataSet.length - 1].timestamp)
                    );
                }

                this.blockDataSet.push(averageBlockInfo);
                if(this.blockDataSet.length > numberOfPeriods)
                    this.blockDataSet.shift();
                DBService.saveDataSet(this.blockDataSet);

                console.log('Added new data-set', averageBlockInfo.height, this.blockDataSet.length);
                return Promise.resolve();
            }
        //}
        //catch(e) {
        //    throw Error('Failed to create data set', e)
        //}
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
        blocksParsed: blockList.length,
        height:blockList[0] ? blockList[0].height : 0,
        timestamp: blockList[0] ? blockList[0].timestamp : 0,
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