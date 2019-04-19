
module.exports = (req, res, next) => {

    if (req.body.team_id) {

        if (req.body.event && req.body.event.type == 'grid_migration_started') {
            // ...
        }

        if (req.body.event && req.body.event.type == 'grid_migration_finished') {
            // ...
        }
    }
    next();
}