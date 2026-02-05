'use strict'
var mysql=require("mysql");
const { config } = require('dotenv');
var fs=require("fs")
config({path:"./.env"});
if(process.env.server=="test"){
	var db_url="npa"
	var db_user="root"
	var db_host="127.0.0.1"
	var db_pass=""
	var db_port="3306"
	var ip = require("ip");
	var ipa=ip.address()
	ipa="localhost"
	exports.host="http://"+ipa+":3008"
	exports.db_interval=0
}
else if(process.env.server=="test-1"){
	//var db_url="hrms_db"
	var db_url="npa"
	var db_user="usery"
	var db_host="localhost"
	var db_pass="feblite1423"
	var db_port="3306"
	exports.host="http://"+ipa+":3008"
	exports.interval=0
	
}
else{
	//var db_url="hrms_db"
	var db_url="npa"
	var db_user="root"
	var db_host="localhost"
	var db_pass="elearn123"
	var db_port="6033"
	exports.host="https://hrms.mubs.ac.ug"
	exports.interval=3
}

exports.db_url=db_url;
exports.db_user=db_user;
exports.db_host=db_host
exports.db_pass=db_pass
exports.title="NPA-SPP"
exports.cyear=new Date().getFullYear()
exports.lm=20
var connection=mysql.createPool(
{
   host: db_host,
   user :db_user,
   password: db_pass,
   database:db_url,
   waitForConnections: true,
   port:db_port,
   connectionLimit:10
})
exports.connection=connection;
var footer="<div></br>--<br>Regards!<br><span>NPA, Strategic Plan Platform</span></div>"
exports.footer=footer
exports.index=function(req,res){
	var data={req,res}
	var rq=req.query.rq;
	
	
	
}
function log_data(userid,table,tableid,arr,message) {
		
	if(arr.length)
		var arr=JSON.stringify(arr);
	else
		arr=""
	var q="INSERT INTO logs(userid,table_affected,table_id,arr,message) VALUES (?,?,?,?,?)";
	connection.query(q,[userid,table,tableid,arr,message],function (err) {
		console.log(arr)
		if(err)		
			console.log(err.sqlMessage)
	})
}
exports.log_data=log_data;
function ajres(data) {
    var req=data.req;var res=data.res;
 		 data.req=0;data.res=0;
 		 res.send(data)
}
exports.ajres=ajres;


exports.pq_or=pq_or;
function gen_code(n) {
  
   var result           = '';
   var characters       = '123456789';
   if(!n)
   		n=6;

   var charactersLength = characters.length;
   for ( var i = 0; i < n; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   
   return result;
}
exports.gen_code=gen_code

function send_sms(data,msg,callback) {
  sms.send(msg)
      .then( response => {
          //console.log(response);
      })
      .catch( error => {
          console.log(error);
          data.errmsg="Unable to send send password, please try again later"
      });
}
exports.send_sms=send_sms;

exports.send_email=send_email;
function count_query(data,qc,arrc,callback) {
  
  connection.query(qc,arrc,function (err,rst) {
    if(err)
      return console.log(err.sqlMessage,qc)
    data.count=0
    if(rst.length){
    	data.count=rst[0].no;
    	if(data.count==undefined)
    		data.count=rst.length
    }
    
    callback()
  })
}
exports.count_query=count_query;
const nodemailer = require("nodemailer");
//send_email({},{email:"slatigo@mubs.ac.ug",html:"<p>Hello world</p>"})
function send_email(data,msg,callback) {
	//var em_host="az1-ss104.a2hosting.com";
	var em_host="smtp.gmail.com"
	//msg.email="slatigo@mubs.ac.ug"
	//var em_host="secure341.inmotionhosting.com"
	var cc=msg.cc;

	check_if_on_leave(msg.email,function (leave) {
			
			if(process.env.server=="test"||process.env.server=="test-1"||leave){
				return 0;
			}


			msg.email2=msg.email
			async function main() {
			  // create reusable transporter object using the default SMTP transport
			  let transporter = nodemailer.createTransport({
			    host: em_host,
			    port: 465,
			    pool:true,
			    secure: true, // true for 465, false for other ports
			    debug:true,
			    auth: {
			       user: "hrms@mubs.ac.ug", // generated ethereal user
			      pass: "ovaeluyigcighjcb", // generated ethereal password
			      //pass:"XG,Z4PrO2BwS"
			    }
			  });
			
			  if(!msg.attachments){

						  let info = await transporter.sendMail({
						    from: '"MUBS HRD Portal" <hrms@mubs.ac.ug>', // sender address
						    to: msg.email, // list of receivers
						    subject: msg.subject, // Subject line
						    html: msg.html, // html body
						    bcc:"hrms@mubs.ac.ug",
						    cc:cc
						  });
						   console.log("sent!",msg.email)
				}
				else{
						
						 	let info = await transporter.sendMail({
					    from: '"MUBS HRD Portal" <hrms@mubs.ac.ug>', // sender address
					    to: msg.email,
					    bcc:"hrms@mubs.ac.ug", // list of receivers
					    subject: msg.subject, // Subject lines
					    html: msg.html, // html body
					    attachments:msg.attachments,
					    cc:cc
					  });
						//transporter.close()
					 
						if(callback&&info.messageId){
								callback(info.messageId)	
						}			
				}
			}
			main().catch(err => {
		    console.error(err.message);
		    //process.exit(1);
			});
	})
	//
}
exports.send_email=send_email;
function pq(req,flds,op) {
   //prepare query
  // options: op=0; insert; op=1;chech

  var qms="";var clms="";var arr=[]

  for(var i=0;i<flds.length;i++){
    var fn=flds[i].fn
    var fn2=flds[i].fn2
    var ft=flds[i].ft;
    if(fn2)
      fn=fn2;
   if(!op){
     
      var sp=flds[i].sp;//special field; query;

      if(sp){
         fv=flds[i].vl;

      }
      else{
         var fv=req.query[fn]
        
         if(fv==null||fv==undefined){
         		fv=req.body[fn]
         }
         	
      }
    arr[i]=fv;
    qms+="?,"
   }
  var fn_as=flds[i].fn_as;
  if(ft=="date"){
  	fn="DATE_FORMAT("+fn+",'%e %b %Y')"
  	

  
  }
  if(ft=="date_1"){
  	fn="DATE_FORMAT("+fn+",'%Y-%m-%d')"
  }

  if(fn_as){
  	fn=fn+" AS "+fn_as
  }


   clms+=fn+",";
  }
  qms=qms.substring(0,qms.length-1)
  clms=clms.substring(0,clms.length-1)
  return {arr:arr,qms:qms,clms:clms}
}
function pq_up(req,flds,op) {
   //prepare query
  // op=0; insert; op=1;select
  var qms="";var clms="";var arr=[]
 
  for(var i=0;i<flds.length;i++){
      var fn=flds[i].fn
      var fn2=flds[i].fn2
      var fv=req.query[fn]

      var sp=flds[i].sp;
       if(sp){
         fv=flds[i].vl;
      }
      else{
         var fv=req.query[fn]
        
         if(fv==null||fv==undefined){
         		fv=req.body[fn]
         }
      }
      if(fv=="null")
      	fv=null
      arr[i]=fv;
      if(fn2)
        qms+=fn2+"=?,"
      else
        qms+=fn+"=?,"
      
   }
  qms=qms.substring(0,qms.length-1)
  return {arr:arr,qms:qms}
}
exports.pq=pq;
exports.pq_up=pq_up
function pq_or(arr,id,tp) {
  var qr=""
  for(var i=0;i<arr.length;i++){
      var val=arr[i];
      if(tp=="text")
        val="'"+val+"'"
      qr+=id+"="+val+" OR "
  }
  qr=qr.substring(0,qr.length-4)
  return qr;
}

function check_privs(data,callback) {
	var user=data.user;
  var id=user.id; 
  var roles=[]
  var q="SELECT name,users.email, org_name, org_id FROM org_admins AS admins,users,orgs WHERE admins.userid=users.id AND orgs.id=org_id AND userid=?  "
  connection.query(q,[id],function (err,rst) {
    if(err)
      return console.log(err.sqlMessage)

    	if(rst.length){
    		var lb="Admin: "+rst[0].org_name;
      	roles[roles.length]={name:lb,priv: "org_admin",org_id:rst[0].org_id,org_name:rst[0].org_name}
      }
     
      q="SELECT *FROM admins,users WHERE admins.userid=users.id AND userid=?"
  		connection.query(q,[id],function (err,rst) {
	        if(err)
	          return console.log(err.sqlMessage)

	        if(rst.length){
	          	roles[roles.length]={name:"System Admin",priv:"admin"}
	        }
	        user.roles=roles;
	        if(data.req)
	          	data.res.cookie("user",user,{maxAge: 45*60*1000})

	          q="SELECT *FROM npa_admins AS admins,users WHERE admins.userid=users.id AND userid=?"
			  		connection.query(q,[id],function (err,rst) {
				        if(err)
				          return console.log(err.sqlMessage)
				        
				        if(rst.length){
				          	roles[roles.length]={name:"NPA Admin",priv:"npa"}
				        }
				        user.roles=roles;
				        if(data.req)
				          	data.res.cookie("user",user,{maxAge: 45*60*1000})

				        callback(user)
				    })
	    })
  })
	    
	
}
exports.check_privs=check_privs;


