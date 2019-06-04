
const connFactory = require('../util/connection-factory');
const logger = require('../common/logger');

module.exports = {
    saveTeamId: (conn, teamData) => {
        conn.apex.post('/refedge/rebot', teamData, (err, res) => {

            if (err) {
                logger.log(err);
            }
        });
    },
    getAccounts: async (teamId, botController) => {

        try {
            let conn = await connFactory.getConnection(teamId, botController);

            if (!conn) {
                throw new Error('not connected to salesforce.');
            }
            let result = await conn.query('SELECT Id, Name, Industry FROM Account LIMIT 3');

            if (!result.done) {
                // you can use the locator to fetch next records set.
                // Connection#queryMore()
                // console.log('next records URL:', result.nextRecordsUrl);
            }
            return result;
        } catch (err) {
            throw err;
        }
    }
};