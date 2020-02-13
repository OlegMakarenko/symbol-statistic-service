module.exports = function(app, db) {
    app.post('/', (req, res) => {

    });

    app.post('/get_dificulty_chart', (req, res) => {                   
        console.log('[POST] ' + '/get_dificulty_chart')
    });
};