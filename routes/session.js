module.exports = function(app) {
  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
}
