
const jsforce = require('jsforce');
const openUrl = require('open');
const { postForm } = require('../common/request-util');

let openConnections = {};
const oauth2 = new jsforce.OAuth2({
    clientId: process.env.SF_CLIENT_ID,
    clientSecret: process.env.SF_CLIENT_SECRET,
    redirectUri: 'https://slackedge.herokuapp.com/sfauth/callback'
});

async function findOrgByTeamId(teamId, botController) {

    try {
        let orgs = await botController.storage.orgs.find({ team_id: teamId });
        return orgs;
    } catch (err) {
        throw err;
    }
}

async function getExistingConnection(teamId, botController) {

    try {
        let orgs = await findOrgByTeamId(teamId, botController);

        if (orgs && orgs.length > 0) {
            let conn = new jsforce.Connection({
                oauth2: oauth2,
                accessToken: orgs[0].access_token,
                refreshToken: orgs[0].refresh_token,
                instanceUrl: orgs[0].instance_url
            });

            conn.on('refresh', (accessToken, res) => {
                try {
                    orgs[0].access_token = accessToken;
                    saveOrg(orgs[0], botController);
                } catch (err) {
                    console.log('connection refresh error:', err);
                }
            });
            openConnections[teamId] = conn;
            return conn;
        }
        return null;
    } catch (err) {
        throw err;
    }
}

function saveOrg(data, botController) {

    try {
        const saveResult = botController.storage.orgs.save(data);
    } catch (err) {
        throw err;
    }
}

async function deleteOrg(teamId, botController) {

    try {
        let orgs = await findOrgByTeamId(teamId, botController);

        if (orgs && orgs.length > 0) {
            let delResult = await botController.storage.orgs.delete(orgs[0].id);
            return 'success';
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getAuthUrl: (teamId) => {
        console.log('teamId:', teamId);
        let authUrl = oauth2.getAuthorizationUrl({ scope: 'api refresh_token web' });
        console.log('authUrl:', authUrl);
        openUrl(authUrl + '&state=' + teamId);
    },
    getConnection: async (teamId, botController) => {

        if (teamId in openConnections) {
            return openConnections[teamId];
        }

        try {
            let conn = await getExistingConnection(teamId, botController);
            return conn;
        } catch (err) {
            throw err;
        }
    },
    connect: async (authCode, botController, teamId) => {

        if (teamId in openConnections) {
            return openConnections[teamId];
        }

        try {
            let conn = await getExistingConnection(teamId, botController);

            if (conn) {
                return conn;
            }
            conn = new jsforce.Connection({ oauth2: oauth2 });

            // TODO : find better way
            conn.on('refresh', async (accessToken, res) => {
                try {
                    let orgs = await findOrgByTeamId(teamId, botController);

                    if (orgs && orgs.length > 0) {
                        orgs[0].access_token = accessToken;
                        saveOrg(org, botController);
                    }
                } catch (err) {
                    console.log('connection refresh error:', err);
                }
            });

            const userInfo = await conn.authorize(authCode);
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
        } catch (err) {
            throw err;
        }
    },
    revoke: async (orgData, botController) => {

        try {
            const result = await postForm(orgData.revokeUrl, { token: orgData.refreshToken });
            delete openConnections[orgData.teamId];
            const deleteResult = await deleteOrg(orgData.teamId, botController);
            return deleteResult;
        } catch (err) {
            throw err;
        }
    }
};