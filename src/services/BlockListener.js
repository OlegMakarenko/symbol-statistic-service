const http = require('./Http');
const config = require('../config.json');
const sdk = require('nem2-sdk');
const statistic = require('./Statistic');
const periodDuration = config.periodDuration;

var lastRecoredBlockHeight = 1;

class BlockListener {
    constructor() {
        this.listener = http.listener;
    
        this.listener.open()
        .then(() => 
            this.listener
                .newBlock()
                .subscribe(
                    block => this.onBlockNewReceived(block), 
                    err => console.error(err)
                )
        );
    }

    onBlockNewReceived(block) {
        const currentBlockHeight = block.height;
        if(
            currentBlockHeight
                .subtract(lastRecoredBlockHeight)
                .compare(sdk.UInt64.fromUint(periodDuration)) 
                >= 0
        )
            {
                lastRecoredBlockHeight = currentBlockHeight; 
                console.log(currentBlockHeight.compact())
                statistic.fetchNewSetOfBlocks(currentBlockHeight.compact())
            }
    }

    close() {
        if(this.listener)
            this.listener.close();
    }
}

module.exports = new BlockListener();