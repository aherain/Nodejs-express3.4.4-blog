var express = require('express');
var routes = require('./routes');
var user=require('./routes/user');
var fs=require('fs');
//应用数据对象
var MongoStore=require('connect-mongo')(express);
var settings=require('./settings');
//添加flash模块
var flash=require('connect-flash');
//结束数据对象添加
var http = require('http');
var path = require('path');
var app = express();
console.log(__dirname);
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 //运用flash
  app.use(flash());
  //app.use(express.bodyParser());
  //支持文件上传功能 
  app.use(express.bodyParser({keepExtensions:true, uploadDir: './public/images'}));
  app.use(express.methodOverride());
  //数据库的相关配置文件
  app.use(express.cookieParser());
  app.use(express.session({
	  secret:settings.cookieSecret,
	  cookie:{maxAge:1000*60*60*24*30},//30 days
	  url:settings.url
	  //key:settings.db,//cookie name
	 //<!-- store:new MongoStore({
//		  db:settings.db
//		本地数据库  })-->
	  
	  }));
	//配置文件结束  
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
routes(app);