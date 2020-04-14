const Constants = require('./constants')
const sdk = require('symbol-sdk')

const createBlockInfoFromDTO = (blockDTO, networkType) =>
  new sdk.BlockInfo(
    blockDTO.meta.hash,
    blockDTO.meta.generationHash,
    createUInt64FromDTO(blockDTO.meta.totalFee),
    blockDTO.meta.numTransactions,
    blockDTO.block.signature,
    createPublicAccountFromDTO(blockDTO.block.signerPublicKey, networkType),
    networkType,
    createVersionFromDTO(blockDTO.block.version),
    blockDTO.block.type,
    createUInt64FromDTO(blockDTO.block.height),
    createUInt64FromDTO(blockDTO.block.timestamp),
    createUInt64FromDTO(blockDTO.block.difficulty),
    blockDTO.block.feeMultiplier,
    blockDTO.block.previousBlockHash,
    blockDTO.block.blockTransactionsHash,
    blockDTO.block.blockReceiptsHash,
    blockDTO.block.stateHash,
    createPublicAccountFromDTO(blockDTO.block.beneficiaryPublicKey, networkType)
  )

const createUInt64FromDTO = uint64DTO =>
  sdk.UInt64.fromNumericString(uint64DTO)

const createPublicAccountFromDTO = (publicKey, networkType) =>
  publicKey === void 0
    ? void 0
    : sdk.PublicAccount.createFromPublicKey(publicKey, networkType)

const createVersionFromDTO = version =>
  parseInt(version.toString(16).substr(2, 2), 16)

const formatBlocks = blockList =>
  blockList.map(block =>
    formatBlock(block)
  )

const formatBlock = block => ({
  height: block.height.compact(),
  timestamp: formatTimestamp(block.timestamp),
  totalFee: formatFee(block.totalFee),
  difficulty: ((block.difficulty.compact() / 1000000000000).toFixed(2)).toString(),
  feeMultiplier: microxemToXem(block.feeMultiplier).toLocaleString('en-US', { minimumFractionDigits: Constants.NetworkConfig.NATIVE_MOSAIC_DIVISIBILITY }),
  numTransactions: block.numTransactions
})

const formatTimestamp = timestamp =>
  Math.round(timestamp / 1000) + Constants.NetworkConfig.NEMESIS_TIMESTAMP

const formatFee = fee =>
  microxemToXem(fee.compact())
    .toLocaleString('en-US', { minimumFractionDigits: Constants.NetworkConfig.NATIVE_MOSAIC_DIVISIBILITY })

const microxemToXem = amount =>
  amount / Math.pow(10, Constants.NetworkConfig.NATIVE_MOSAIC_DIVISIBILITY)

module.exports = {
  createBlockInfoFromDTO,
  formatBlocks,
  formatTimestamp
}