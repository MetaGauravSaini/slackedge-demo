
const checkTeamMigration = async (teamId, controller) => {

    try {
        const team = await controller.storage.teams.get(teamId);

        if (!team) {
            return false;
        }

        if (team.is_migrating) {
            return true;
        }
        return false;
    } catch (err) {
        throw err;
    }
}

module.exports.checkTeamMigration = checkTeamMigration;
module.exports.getFilterMiddleware = controller => {
    return async (bot, message, next) => {

        try {
            const isTeamMigrating = await checkTeamMigration(message.team_id, controller);

            if (!isTeamMigrating) {
                next();
            }
        } catch (err) {
            throw err;
        }
    }
}