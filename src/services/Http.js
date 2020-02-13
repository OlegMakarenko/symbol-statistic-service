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
        let blockHeight
        if (fromBlockHeight === void 0)
            blockHeight = 'latest'
        else
            blockHeight = fromBlockHeight.toString()
    
        const path = `/blocks/from/${blockHeight}/limit/${limit}`
        const response = await axios.get(nodeUrl + path)
            .catch(err => { throw Error('Failed to get blocks', err) });
        const blocks = response.data.map(blockDTO => format.createBlockInfoFromDTO(blockDTO, this.repositoryFactory.networkType))

        return format.formatBlocks(blocks);
      }
}



module.exports = new Infrastructure();