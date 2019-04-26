module.exports = async (teamId, controller) => {

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