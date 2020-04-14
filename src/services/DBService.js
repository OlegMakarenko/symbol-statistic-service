// TODO: add Mongo
const fs = require('fs')

const saveDataSet = dataSet => {
  fs.writeFileSync('data-set.json', JSON.stringify(dataSet))
}

const getDataSet = () => {
  return new Promise ((resolve, reject) => {
    fs.readFile('data-set.json', (err, data) => {
      if (err) reject(err)
      try {
        const json = JSON.parse(data)
        resolve(json)
      }
      catch(err) {
        reject(err)
      }
    })
  })

}

module.exports = {
  saveDataSet,
  getDataSet
}