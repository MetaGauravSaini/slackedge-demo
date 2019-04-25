
const checkTeamMigration = async (teamId, controller) => {

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

module.exports.checkTeamMigration = checkTeamMigration;
module.exports.getFilterMiddleware = controller => {
    return async (patterns, message) => {

        try {
            const isTeamMigrating = await checkTeamMigration(message.team_id, controller);
            return isTeamMigrating;
        } catch (err) {
            throw err;
        }
    }
}