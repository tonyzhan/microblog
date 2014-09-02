var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
//app.use(logger('dev'));
app.use(logger({stream: accessLogfile}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


//cookie解析的中间件
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

//提供session支持
app.use(session({
  secret: settings.cookieSecret,
  store: new MongoStore({
      db: settings.db,
  })
}));


app.use(function(req, res, next){
  console.log("app.usr local");
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length ? error : null;
 
  var success = req.flash('success');
  res.locals.success = success.length ? success : null;
  next();
});


app.use('/', routes);
if (!module.parent) {
  app.listen(8080);
  //console.log("Express服务器启动, 开始监听 %d 端口, 以 %s 模式运行.", app.address().port, app.settings.env);
}

app.use('/users', users);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        var meta = '[' + new Date() + ']' +req.url + '\n';
        errorLogfile.write(meta +err.stack + '\n');
        next();
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    var meta = '[' + new Date() + ']' +req.url + '\n';
    errorLogfile.write(meta +err.stack + '\n');
    next();
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
