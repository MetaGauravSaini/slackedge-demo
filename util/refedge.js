
const connFactory = require('../util/connection-factory');

module.exports = {
    getAccounts: async (teamId, botController) => {

        try {
            let conn = await connFactory.getConnection(teamId, botController);
            let result = await conn.query('SELECT Id, Name FROM Account LIMIT 2');

            if (!result.done) {
                // you can use the locator to fetch next records set.
                // Connection#queryMore()
                console.log("next records URL : " + result.nextRecordsUrl);
            }
            return result;
        } catch (err) {
            throw err;
        }
    },
    saveTeamId: (conn, teamId) => {
        conn.apex.post(
            '/slackedge',
            { teamId: teamId },
            (err, res) => {

                if (err) {
                    console.log('save error:', err);
                }
            }
        );
    }
};