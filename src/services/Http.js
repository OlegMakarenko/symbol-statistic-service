const axios = require('axios');
const config = require('../config.json');
const sdk = require('nem2-sdk');
const format = require('../format')
const nodeUrl = config.nodeUrl;



class Infrastructure {
    constructor() {
        this.repositoryFactory = new sdk.RepositoryFactoryHttp(nodeUrl);
        this.blockHttp = this.repositoryFactory.createBlockRepository();
        this.listener = this.repositoryFactory.createListener();
    }

    getBlocksFromHeightWithLimit = async (limit, fromBlockHeight) => {
        console.log('Get block info from height:' + fromBlockHeight + ' with limit: ' + limit);

        if(!limit || limit === 0)
            limit = 100;

        const apiCallsCount = Math.ceil(limit / 100);
        let blocksData = [];

        for(let i = 0; i < apiCallsCount; i++) {
            const blocksDataPage = await this.fetchBlocksFromHeight(fromBlockHeight - 100 * i);
            if(blocksDataPage)
                blocksData = [ ...blocksData, ...blocksDataPage];
        }
        
        return blocksData.slice(0, limit - 1)
    }

    fetchBlocksFromHeight = async (fromBlockHeight) => {
        console.log('Fetch block data from height:', fromBlockHeight)
        let blockHeight
        if (fromBlockHeight === void 0)
            blockHeight = 'latest'
        else
            blockHeight = fromBlockHeight.toString()
    
        const path = `/blocks/from/${blockHeight}/limit/100`
        const response = await axios.get(nodeUrl + path)
            .catch(err => { throw Error('Failed to get blocks', err) });
        const blocks = response.data.map(blockDTO => format.createBlockInfoFromDTO(blockDTO, this.repositoryFactory.networkType))

        return format.formatBlocks(blocks);
    }
}



module.exports = new Infrastructure();