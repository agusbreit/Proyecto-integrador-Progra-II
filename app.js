var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product');
var session = require('express-session');
const db = require('./database/models'); //es nunevo lo agregue para cuando se necesite
const Usuario = db.Usuario;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'fantasyStore',
  resave: false,
  saveUninitialized: true,
}));

app.use(function(req,res,next){
  if (req.session.user != undefined) {
    res.locals.user = req.session.user
  }
  return next();
})


//preguntamos por la cookie y la vinculamos con la session
app.use(function (req, res, next) {
  if (req.cookies.userId != undefined && req.session.user == undefined) { //necesito que el usuario este fuera de la sesion y que quiere iniciar directamente porque lo recorde
    let userId = req.cookies.userId;
    //tengo que ir a la db y preguntar quien es el ID que tenngo guardado en la cookie
    Usuario.findByPk(userId)
      .then(function(user){
        req.session.user = user.dataValues
        res.locals.user = user.dataValues
        return next();
      })
      .catch(error => console.log(error))
  } else {
    return next();
  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product', productRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
