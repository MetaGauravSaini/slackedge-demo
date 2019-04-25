const controller = require('../../bot');

const checkTeamMigration = async teamId => {
    const team = await controller.storage.teams.get(teamId);

    if (!team) {
        return true;
    }

    if (team.is_migrating) {
        return false;
    }
    return true;
}

module.exports.filterMiddleware = async (patterns, message) => {
    const isTeamMigrating = await checkTeamMigration(message.team_id);
    return isTeamMigrating;
}
module.exports.checkTeamMigration = checkTeamMigration;