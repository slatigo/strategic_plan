var express  = require('express');
var routes   = require('./routes');
var db   = require('./routes/db');
var org_admin   = require('./routes/org_admin');
//var bodyParser = require('body-parser')
var http = require('http');
var https = require('https')
var path = require('path');
var mysql=require("mysql");
var db_url=db.db_url
var db_user=db.db_user
var db_host=db.db_host
var db_pass=db.db_pass
var connection=db.connection;
var flash=require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs=require('fs');
//var ip=require("ip")
var cors = require('cors')
var https = require('https');
var fs = require('fs');

var multer  = require('multer')
var fileUpload = require('express-fileupload');
const { config } = require('dotenv');
config();
var app = express();
// all environments
var port=process.env.PORT
app.set('port', port || 3008);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true); // Enable Express to respect X-Forwarded-For
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
var cookieParser=require("cookie-parser")
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: '*'
}));

app.use(fileUpload());

app.get('/image/:filename', (req, res) => {

  const filename = req.params.filename;
  
  const imagePath =  process.cwd()+'/uploads/clockins/'+filename

  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

var supervisor=require("./routes/supervisor")
app.get("/supervisor",supervisor.index)
app.post("/supervisor",supervisor.index)


app.get("/",routes.index)
app.post("/",routes.index)
app.get("/org_admin",org_admin.index)
app.post("/org_admin",org_admin.index)
app.get("/gen",db.index)

var admin=require("./routes/admin")
app.post("/admin",admin.index)
app.get("/admin",admin.index)


var npa=require("./routes/npa")
app.post("/npa",npa.index)
app.get("/npa",npa.index)
var ip=require("ip")
app.post('/login',function(req, res, next) {
  var uagent=req.headers['user-agent']
  var ipa=req.socket.remoteAddress
  //var ipa=ip.address()

  passport.authenticate('user', function(err, user, info) {
          if (err) { return next(err); }
          //"Failed-Inactive"
          
          if(info.lgmsg){

            log_login(info.userid,info.lgmsg,uagent,ipa)
          }
          if (!user) { 
            var msg=info.msg;
            res.send({msg:msg})
            return 0;
          }
          user=default_role(req,res,user);//assign role from cookies
         
          req.logIn(user, function(err) {
          res.cookie("user-client",JSON.stringify(user))
        
          res.cookie("user",user)
          res.send({msg:"ok",user:user})
          });
          
  })(req, res, next);   
})
function log_login(userid,status,uagent,ipa) {
  var q="INSERT INTO lglogs(userid,status,uagent,ip) VALUES (?,?,?,?)"
  connection.query(q,[userid,status,uagent,ipa],function (err,rst) {
    if(err){console.log(err.sqlMessage)}
  })
}
function default_role(req,res,user) {
  var roles=user.roles
  var rh=["admin","org_admin","npa",""]//roles heiracy
    user.priv=0

    var spriv=req.cookies.spriv;//saved priviledge from cookie
    var sdept_id=req.cookies.sdept_id

    for(var j=0;j<rh.length;j++){
        for(var i=0;i<roles.length;i++){
          var priv=roles[i].priv

          if(spriv==roles[i].priv){
            user.priv=priv;
            user.dept_id=roles[i].dept_id
            user.title=roles[i].title
             user.org_id=roles[i].org_id
            res.cookie("spriv",priv)
            break;
          }

          if(priv==rh[j]){
            user.priv=priv;
            user.dept_id=roles[i].dept_id
            user.paccess=roles[i].paccess
            user.repto=roles[i].repto
            user.title=roles[i].title
            user.org_id=roles[i].org_id

           
            res.cookie("spriv",priv)
            break;
          }
        }
        if(user.priv){
          //checks if role has been assigned
          break;
        }
  }
  return user
}

app.get("/refresh",function (req,res) {

  if(req.cookies.user&&req.cookies.user!="0")
      req.user=req.cookies.user;
   else
      req.user=0
   if(!req.user){
      return res.send({errmsg:"Your Session expired",et:"session-expired"})
      
   }
  var data={user:req.user,req:req,res:res}
  db.check_privs(data,function (user) {
    res.send({roles:user.roles,user:user})
  })
})
//SWITCH ROLE

app.get("/switch",function (req,res) {
  if(req.cookies.user&&req.cookies.user!="0")
      req.user=req.cookies.user;
   else
      req.user=0
  if(!req.user){
      return res.redirect("/")
  }
  var priv=req.query.priv;
  var dept_id=req.query.dept_id;
  var roles=req.user.roles;
  for(var i=0;i<roles.length;i++){
    var f=0
     if((roles[i].priv==priv&&dept_id==roles[i].dept_id)||(roles[i].priv==priv)&&(priv=='admin'||priv=='hr')){
        req.user.priv=priv;
        req.user.dept_id=dept_id;
        req.user.paccess=roles[i].paccess;
        req.user.title=roles[i].title
        req.user.phtitle=roles[i].phtitle
        req.user.acting=roles[i].acting;
        req.user.rpos=roles[i].rpos

        var f=1;
        break;
     }
  }
  res.cookie("user",req.user,{maxAge: 50*60*1000})
  res.cookie("spriv",priv)
  res.cookie("sdept_id",dept_id)
  if(f==0)
    res.redirect("/signout")
  else
    res.redirect("/"+priv)
})
app.get("/signout",function (req,res) {
  if(req.cookies.user){
    var user=req.cookies.user;
    if(typeof user=="string")
      user=JSON.parse(user)
  }
  else
    var user=req.user;
    req.logout(function(){
      
    })
    res.cookie("user","")
   res.redirect("/")
  
})


app.get('/auth/google',
  passport.authenticate('google', { scope: ['email','profile'] })
);

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        failureRedirect: '/?rq=no-account'}),function (req,res) {
        var user=default_role(req,res,req.user);//assign role from cookies
        res.cookie("user",user)
        res.redirect("/")
        
          
        }
    );
function check_google_login(username,done) {
  connection.query("SELECT *FROM users WHERE email=?",[username],function(err,rst){
            if(err){console.log("Error"+err); return done(err)}
           
            if(rst.length>0)
            {
              
                let userid2=rst[0].id;
                if(rst.length&&rst[0].acc_status=='Active'){
                    var user={id:rst[0]["id"],email:rst[0].email,status:rst[0].status,name:rst[0].name}
                    var userid=user.id;
                   
                    db.check_privs({user:user},function (roles) {
                      return done(null,user,{lgmsg:"Successful",userid:userid});
                    })
                    
                }
                else if(rst.length&&rst[0].acc_status=='Inactive'){
                    var userid=rst[0].id;
                    return done(null,false,{msg:"inactive",lgmsg:"Failed-Inactive",userid:userid});
                }
                else{
                   return done(null,false,{msg:"wrong-password",lgmsg:"Failed",userid:userid2});
                }
                
            }
            else
            { 
              log_wrong_user(username)
              return done(null,false,{msg:"wrong-email"});
            }
    })
}
passport.use("user",new LocalStrategy(function(username,password,done){
   check_user_creds(username,password,done)
}));

function check_user_creds(username,password,done) {
  connection.query("SELECT *FROM users WHERE email=?",[username],function(err,rst){
            if(err){console.log("Error"+err); return done(err)}

            if(rst.length>0)
            {
               
                let userid2=rst[0].id;
              
               
               // AND password=SHA1(?) AND acc_status='Active'
               
                var q="SELECT *FROM users WHERE email=? AND password=SHA1(?)"

                connection.query(q,[username,password],function (err,rst) {
                    
                    if(err){return console.log(err.sqlMessage)}
                    
                    if(rst.length&&rst[0].acc_status=='Active'){
                        var user={id:rst[0]["id"],email:rst[0].email,status:rst[0].status,name:rst[0].name}
                        var userid=user.id;
                       
                        db.check_privs({user:user},function (roles) {
                          return done(null,user,{lgmsg:"Successful",userid:userid});
                        })
                        
                    }
                    else if(rst.length&&rst[0].acc_status=='Inactive'){
                        var userid=rst[0].id;
                        return done(null,false,{msg:"inactive",lgmsg:"Failed-Inactive",userid:userid});
                    }
                    else{
                       return done(null,false,{msg:"wrong-password",lgmsg:"Failed",userid:userid2});
                    }
                })
            }
            else
            { 
              log_wrong_user(username)
              return done(null,false,{msg:"wrong-email"});
            }
    })
}
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
passport.use(new GoogleStrategy({
    clientID:     "41441796696-nppcbondp49chda0g4v0j6vj0natij4m.apps.googleusercontent.com",
    clientSecret: "42SH8n1RzTcJvE9wg1dyMvYf",
    callbackURL: db.host+"/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
       check_google_login(profile.email,done)

  }
));
function log_wrong_user(username) {
    var q="INSERT INTO logs_wrong_user(username) VALUES(?)"
    connection.query(q,[username],function (err,rst) {
      if(err){return console.log(err.sqlMessage)}
    })
}

passport.serializeUser(function(user, done) {
    var key = {
      id: user.id,
      type: user.type
    }
    done(null, key);
});
passport.deserializeUser(function(key,done){
    var id=key.id
  var q='SELECT *FROM users WHERE id=?';
   connection.query(q,[id],function(err,rst){
         if(err){
              return console.log(err)
          }
        var user={id:rst[0]["id"],email:rst[0]["email"],status:rst[0].status,priv:rst[0].priv,name:rst[0].name}
        db.check_privs({user:user},function (roles) {
          user.roles=roles;
          return done(null,user);
        })
   })
});//deserialize
var server=app.listen(port,function  () {
console.log("App Listening on port "+port)
})