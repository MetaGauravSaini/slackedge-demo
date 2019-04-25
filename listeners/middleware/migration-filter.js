const controller = require('../../bot');

const checkTeamMigration = async teamId => {
    
    try {
        const team = await controller.storage.teams.get(teamId);
    
        if (!team) {
            return true;
        }
    
        if (team.is_migrating) {
            return false;
        }
        return true;
    } catch (err) {
        throw err;
    }
}

module.exports.filterMiddleware = async (patterns, message) => {

    try {
        const isTeamMigrating = await checkTeamMigration(message.team_id);
        return isTeamMigrating;
    } catch (err) {
        throw err;
    }
}
module.exports.checkTeamMigration = checkTeamMigration;