
module.exports = {
    notFound: (req, res, next) => {
        const err = new Error('not found!!');
        err.status = 404;
        next(err);
    },
    internalError: (error, req, res, next) => {
        console.log(error);
        res.status(error.status || 500).json({
            status: error.status || 500,
            message: error.message
        });
    }
};