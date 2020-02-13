const http = require('./Http');
const config = require('../config.json');
const sdk = require('nem2-sdk');
const format = require('../format')
const statistic = require('./Statistic');
const periodDuration = config.periodDuration;

var lastRecoredBlockTimestamp = 1;

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
        const currentBlockTimestamp = format.formatTimestamp(block.timestamp.compact());
        if(currentBlockTimestamp - lastRecoredBlockTimestamp >= periodDuration){
            lastRecoredBlockTimestamp = currentBlockTimestamp; 
            console.log(currentBlockTimestamp)
            statistic.fetchNewSetOfBlocks(block.height.compact())
        }
    }

    close() {
        if(this.listener)
            this.listener.close();
    }
}

module.exports = new BlockListener();