
// const mongoose = require('mongoose');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// let db = mongoose.createConnection(`mongodb+srv://gaurav-saini:${process.env.MONGO_PW}@slackedge-test-skasp.mongodb.net/se-logs?retryWrites=true`);



module.exports = {
    log: data => {
        console.log(data);
    }
};