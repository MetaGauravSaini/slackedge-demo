
const jsforce = require('jsforce');
const openUrl = require('open');

let openConnections = {};
const oauth2 = new jsforce.OAuth2({
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    redirectUri: 'https://0b11e5bf.ngrok.io/sfauth/callback'
});

function saveOrg(data, botController) {

    botController.storage.orgs.save(data, (err, id) => {

        if (err) {
            throw new Error(err);
        } else {
            // saved successfully
        }
    });
}

module.exports = {
    getAuthUrl: () => {
        let authUrl = oauth2.getAuthorizationUrl({ scope: 'api refresh_token' });
        openUrl(authUrl);
    },
    connect: (authCode, botController, teamId) => {

        if (teamId in openConnections) {
            return openConnections[teamId];
        }

        botController.storage.orgs.find({ team_id: teamId }, (err, orgs) => {

            if (orgs && orgs.length > 0) {
                let conn = new jsforce.Connection({
                    oauth2: oauth2,
                    accessToken: orgs[0].access_token,
                    refreshToken: orgs[0].refresh_token,
                    instanceUrl: orgs[0].instance_url
                });

                conn.on('refresh', (accessToken, res) => {
                    orgs[0].access_token = accessToken;
                    saveOrg(orgs[0], botController);
                });
                openConnections[teamId] = conn;
                return conn;
            } else {
                let conn = new jsforce.Connection({ oauth2: oauth2 });

                // TODO : find better way
                conn.on('refresh', (accessToken, res) => {

                    botController.storage.orgs.find({ team_id: teamId }, (err, orgs) => {

                        if (orgs && orgs.length > 0) {
                            orgs[0].access_token = accessToken;
                            saveOrg(org, botController);
                        }
                    });
                });

                conn.authorize(authCode, (err, userInfo) => {

                    if (err) {
                        throw new Error(err);
                    }
                    let org = {
                        id: userInfo.organizationId,
                        access_token: conn.accessToken,
                        refresh_token: conn.refreshToken,
                        instance_url: conn.instanceUrl,
                        user_id: userInfo.id,
                        team_id: teamId,
                        revoke_url: conn.oauth2.revokeServiceUrl
                    };
                    saveOrg(org, botController);
                    openConnections[teamId] = conn;
                    return conn;
                });
            }
        });
    },
    revoke: () => {
        // TODO : implement revoke
    }
};