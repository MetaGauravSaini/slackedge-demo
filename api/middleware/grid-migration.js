
const controller = require('../../bot');

module.exports = async (req, res, next) => {

    try {

        if (req.body.team_id) {

            if (req.body.event && req.body.event.type == 'grid_migration_started') {
                let team = await controller.storage.teams.get(req.body.team_id);

                if (team) {
                    team.is_migrating = true;
                    const saveResult = await controller.storage.teams.save(team);
                    req.body.isMigrationStarted = true;
                    next();
                }
            }

            if (req.body.event && req.body.event.type == 'grid_migration_finished') {
                // ...
            }
        }
        next();
    } catch (err) {
        throw err;
    }
}