'use strict'
var db= require('./db');
var connection=db.connection;
var multer  = require('multer')
var fileUpload = require('express-fileupload');
var departments=require("./departments")
var positions=require("./positions")
var bio=require("./bio")
exports.index=function (data) {
	var rq=data.rq;
	var res=data.res;
	var req=data.req

	if(rq=="get-defaults"){		
		get_leaves(data,function () {

			departments.get_all_depts(data,function () {
				db.get_holidays(data,function () {
					db.ajres(data)
				})
				
			})
		})		
	}
	else if(rq=="get-leaves"){

		get_leaves(data,function () {

			if(data.req[data.rt].download==1)
				download_leave_list(data)
			else
				db.ajres(data,res)
			
		})	
	}
	else if(rq=="cancel-leave"){
		db.cancel_leave(data,function () {
			get_leaves(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="get-contracts"){
		bio.get_contracts(data,function () {
			db.ajres(data)
		})
	}
	else if(rq=="change-dept"){
		change_dept(data,function () {
			get_leaves(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="change-status"){
		change_status(data,function () {
			get_leaves(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="defer-leave"){
		defer_leave(data,function () {
			get_leaves(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="change-contract"){
		change_contract(data,function () {
			get_leaves(data,function () {
				db.ajres(data)
			})
		})
	}
	else if(rq=="download-file"){
		var id=req.query.id
		var leave_type=req.query.leave_type
		var recorded=req.query.recorded
		var path=process.cwd()+"/uploads/leave/"+id+".pdf"
		var file_name=leave_type+"-"+recorded+".pdf"
		db.open_new_tab(res,file_name,path)
		//res.download(dir,leave_type+"-"+recorded+".pdf")
	}
	else{

		res.render("hr-leave",data)
	}

}

function get_leaves(data,callback) {
	var req=data.req;
	var userid=req.user.id;
	var dept_id=req.user.dept_id
	var os=req[data.rt].os;
    if(os){
       os=Number(os)
       if(os<0)
         os=0;
    }
   	else{
       os=0;
    }
    data.os=os
	var status=req.query.status
	
	data.status=status
	var endsin=""
	if(status=="Pending Return"){
		data.status=status
		var status="Approved by Principal"
		endsin=" AND endsin<=0"
    
	}
	else if(status=="Approved by Principal"){
		data.status=status
		var status="Approved by Principal"
		endsin=" AND endsin>=0"
	}
	else if(status=="Pending"){
		data.status=status
		var status="%Pending%"
		endsin=""
	}
	if(status)
		;
	else
		var status="Pending Approval of Principal"

	var status_o=status


	var search_name=req.query.search_name;

	var status=" AND status LIKE '"+status+"'"
	if(search_name)
		var qc=db.leaveq()+" AND (name LIKE '%"+search_name+"%' OR leave_phone LIKE '%"+search_name+"%' OR leave_address LIKE '%"+search_name+"%')"
	else
		var qc=db.leaveq()+status+endsin


	if(data.req[data.rt].download==1){
		//data.reminder//if contract soon ending
		q=qc;
	}
	else
		var q=qc+" LIMIT ? OFFSET ?"

	var arr=[db.lm,os]
	var arrc=[]
	
	connection.query(q,arr,function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		data.leaves=rst;
		if(qc){
			db.count_query(data,qc,arrc,function(){
	         callback()
	      })
	    }
	    else{
	    	callback()
	    }
	})
}
exports.get_leaves=get_leaves
var Excel = require('exceljs');
async function download_leave_list(data) {
var req=data.req;

var clms=[{header:"Applicant",key:"name",width:30},{header:"Position",key:"psn",show:1,width:30},{header:"Department",key:"fdept",width:30},{header:"Leave type",key:"leave_type",width:20},{header:"Status",key:"status"},{header:"Leave Start",key:"leave_start_f"},{header:"Duration (Days)",key:"dur"},{header:"Leave End",key:"leave_end_f"},{header:"Address on Leave",key:"leave_address"},{header:"Phone on Leave",key:"leave_phone"},{header:"Deferred",key:"deferred"},{header:"Reason for Deferment",key:"df_reason"},{header:"Leave Start(before deferment)",key:"leave_start_bd_f"},{header:"Leave End (before deferment)",key:"leave_end_bd_f"},{header:"Application date",key:"app_date",width:20}]
	var bfclms=req.query.bio_flds;//selected columns
	
	var leaves=data.leaves;
	var workbook = new Excel.Workbook()
	//new Excel.Workbook();
		var worksheet = workbook.addWorksheet("Leave Applications",{pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0}});
		worksheet.columns = clms
		const headerRow = worksheet.getRow(1);
		headerRow.eachCell((cell) => {
	        cell.alignment = { wrapText: true };
	        cell.font = { bold: true };
	        cell.border = {
	            top: { style: 'thin' },
	            left: { style: 'thin' },
	            bottom: { style: 'thin' },
	            right: { style: 'thin' }
        	};
	    });
		for(var i=0;i<leaves.length;i++){
			
			var pdept=leaves[i].pdept;
			if(pdept)
				pdept=", "+pdept
			else
				pdept=""
			leaves[i].fdept=leaves[i].dept+pdept;
			var rd={}
			for(var j=0;j<clms.length;j++){
				var key=clms[j].key;
				var width=clms[j].width;
				
				if(!width)
					clms[j].width=20
				var val=leaves[i][key];
				if(val==null||val=="null")
					val=""

				rd[key]=val;
			}
			var rx=worksheet.addRow(rd)
			
			rx.eachCell((cell) => {
				cell.alignment = { wrapText: true };
			
	            cell.border = {
	                top: { style: 'thin' },
	                left: { style: 'thin' },
	                bottom: { style: 'thin' },
	                right: { style: 'thin' }
	            };
		    });
		}
		var ri=1;
		for(ri;ri<=worksheet.rowCount;ri++){
			worksheet.getRow(ri).alignment={wrapText:true}
		}
		
		
		var dt=new Date();//original date
		var dtf=dt.getDate()+"-"+(dt.getMonth()+1)+"-"+dt.getFullYear()+"-"+dt.getHours()+"_"+dt.getMinutes()+"_"+dt.getSeconds()
		//var tempFilePath = tempfile('.xlsx');
		const buffer = await workbook.xlsx.writeBuffer();
		data.res.writeHead(200, {
	    'Content-Disposition': "attachment; filename=Leave Applications-"+dtf+".xlsx",
	    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	  	})
	  	data.res.end(buffer)
		/*workbook.xlsx.writeFile(tempFilePath)
		.then(function() {
			res.download(tempFilePath,data.pr_title+".xlsx")
		});*/
}
function change_dept(data,callback) {
	var req=data.req;
	var rdept_id=req.query.crdept_id;
	var leave_id=req.query.leave_id
	var q="UPDATE leave_applications SET rdept_id=? WHERE id=?"
	connection.query(q,[rdept_id,leave_id],function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()
		var tableid=leave_id
		var arr=[rdept_id,leave_id]
		db.log_data(req.user.id,"leave_applications",tableid,arr,"Change leave reporting department");
	})
}


function change_contract(data,callback) {
	var req=data.req;
	var contract_id=req.query.contract_id;
	var leave_id=req.query.leave_id

	var q="UPDATE leave_applications SET contract_id=? WHERE id=?"
	connection.query(q,[contract_id,leave_id],function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()
		var tableid=leave_id
		var arr=[contract_id,leave_id]
		db.log_data(req.user.id,"leave_applications",tableid,arr,"Change leave contract");
	})
}
function change_status(data,callback) {
	var req=data.req;
	var status=req.query.nstatus;
	var leave_id=req.query.leave_id

	var q="UPDATE leave_applications SET status=? WHERE id=?"
	connection.query(q,[status,leave_id],function (err,rst) {
		if(err){return console.log(err.sqlMessage)}
		callback()
		var tableid=leave_id
		var arr=[status,leave_id]
		db.log_data(req.user.id,"leave_applications",tableid,arr,"Change leave status");
	})
}

function defer_leave(data,callback) {
	var req=data.req;
	var status=req.query.status;
	data.status=status
	var id=req.query.leave_id;
	var comment=""
	var deferred=req.query.deferred
	if(deferred=="Yes"){
		data.deferred="Yes"
		var leave_start=req.query.leave_start;
		var leave_end_df=req.query.leave_end_df
		var leave_start_df=req.query.leave_start_df//deferred leave start
		var df_reason=req.query.df_reason
		var q="UPDATE leave_applications SET xuserid=?,xdate=now(),leave_start=?,leave_end=?,deferred=?,df_reason=? WHERE id=?"
		var arr=[req.user.id,leave_start_df,leave_end_df,deferred,df_reason,id];

		var approved=1
	}
	connection.query(q,arr,function (err,rst) {
		if(err)
			return console.log(err.sqlMessage)
		db.send_status_update(data)
		var tableid=id;
		db.log_data(req.user.id,"leave_applications",tableid,arr,"Change leave status");
		db.get_leave_by_id(data,function (leave) {
			
			callback()
		})
		
	})
	
}