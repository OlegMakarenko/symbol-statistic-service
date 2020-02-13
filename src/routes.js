const staistic = require('./services/Statistic')

module.exports = function(app, db) {
    app.post('/', (req, res) => {

    });

    app.get('/get_all_statistics', (req, res) => {                   
        console.log('[GET] ' + '/get_dificulty_chart')
        const dataSet = staistic.getAllStatistics();
        if(dataSet instanceof Object)
            res.send(JSON.stringify(staistic.getAllStatistics()), null, 2)
        else
            res.send(Error('Cannot get data set'))
    });
};