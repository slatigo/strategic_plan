adata.pg="leave"
$(function () {
	//The app loads then using ajax, requests data to fill up the page
	get_default()
	populate_cs_day()
})
function get_default(){
	
	var data={url:adata.url,rq:"get-default"}
	
	ajax_go(data,function (rst) {
		show_div("leave-card")
		load_leaves(rst)
		adata.hols=rst.hols;
		if(adata.crit=="name")
			$("#leave-status-hdr").text("")
		else
			$("#leave-status-hdr").text("Leave Status: "+rst.status)
		
	})
}
function search_leave(el) {

	 var code=el.keyCode
    if(code==13){
    	adata.crit="name"
     	get_leaves()
    }
	
}

function get_leaves_def(status) {
	adata.status=status;
	adata.crit=0
	get_leaves()
}
function get_leaves(pager){
	if(pager=="next")
	    var os=adata.os+lm;
	else if(pager=="previous")
	      var os=adata.os-lm;
	else{
	      var os=0;
	}
	var data={url:adata.url,rq:"get-leaves",status:adata.status}

	if(adata.crit=="name"){
		var search_name=$("#search_name").val()
		data.search_name=search_name;
	}
	data.os=os;
	ajax_go(data,function (rst) {
		show_div("leave-card")
		load_leaves(rst)

		if(adata.crit=="name")
			$("#leave-status-hdr").text("")
		else
			$("#leave-status-hdr").text("Leave Status: "+rst.status)
		
	})
}
function load_leaves(rst) {
	$("#leave-status-hdr").text(rst.status)
	var leaves=rst.leaves;
	adata.leaves=leaves
	//leave_start_f; formated leave start
	var flds=[{lb:"Applicant",fn:"name"},{lb:"Leave type",fn:"leave_type_fm"},{lb:"Status",fn:"status"},{lb:"Leave Start",fn:"leave_start_f"},{lb:"Leave End",fn:"leave_end_f"},{lb:"Duration",fn:"dur_f"},{lb:"Address on Leave",fn:"leave_address"},{lb:"",ft:"btn",text:"View",oc:"view_leave"}]
	var status=rst.status;
	if(status=="Returned")
		flds.splice(3,0,{lb:"Return Date",fn:"return_date_f"})
	for(var i=0;i<leaves.length;i++){
		leaves[i].ostatus=leaves[i].status
		var file=leaves[i].file;
		var pdept=leaves[i].pdept

		if(pdept==null)
			pdept=""
		else
			pdept+=", "
		leaves[i].applicant=leaves[i].name
		leaves[i].name+="<br><span style='font-size:11px;color:blue'>"+leaves[i].psn+","+pdept+leaves[i].dept+"</span>"
		var status=leaves[i].status
		var dur=leaves[i].dur
		var dur_f=dur+" Days";
		if(dur==1)
			dur_f=dur+" Day"
		leaves[i].dur_f=dur_f
		var ucd=leaves[i].ucd;
		if(!ucd)
			ucd=0;
		
		var endsin=(-1*leaves[i].endsin);
		var startsin=(leaves[i].startsin);
		if(startsin<1&&leaves[i].status.includes("Pending"))
			leaves[i].leave_start="<span style='color:red'>"+leaves[i].leave_start+"</span>"
		if(rst.status=="Pending Return")
			leaves[i].leave_end+="<br><span style='font-size:10px;color:blue'>Exceeded by "+endsin+" days"
		
		if(file==1)
			att=" <i class='fa fa-paperclip'></i>"
		else
			att=""
		leaves[i].leave_type_fm="<span> "+att+"<span>"+leaves[i].leave_type+"</span></span>";
		var status=leaves[i].status
		if(status=="Approved by Principal"){
			var ra=leaves[i].return_accepted
			var return_date=leaves[i].return_date_f

			if(ra==null&&return_date){
				leaves[i].status+="<br><span style='font-size:10px;color:blue'>Return Date: "+return_date+"(Pending approval)"
			}
		}
	}
	pager("leave",rst.os,leaves,rst.count)
	gen_table(flds,leaves,"leave-div","No leave applications for selected status")
}

function change_return_status(status) {
	var leave_id=adata.leave_id;
	var data=prep_data([]);if(!data){return 0}
	data.rq="change-return-status"
	data.leave_id=leave_id;
	data.status=status
	data.comment=$("#comment").val()
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_leaves(rst)
	})
}
function view_leave(index) {
	$("#comment-div,#defer-div").hide()
	$("#leave-details-div,#approval-div").show()
	$(".leave-btn").hide()
	var leave=[adata.leaves[index]]
	adata.leave_id=leave[0].id
	adata.index=index
	adata.dur=leave[0].dur;
	adata.leave_type=leave[0].leave_type
	adata.hdept_id=leave[0].hdept_id;
	adata.icuserid=leave[0].icuserid
	adata.userid=leave[0].userid;

	var flds=[{lb:"Applicant",fn:"name"},{lb:"Leave type",fn:"leave_type"},{lb:"Application date",fn:"app_date"},{lb:"Status",fn:"status"},{lb:"Leave Start",fn:"leave_start_f"},{lb:"Leave End",fn:"leave_end_f"},{lb:"Address on Leave",fn:"leave_address"},{lb:"Phone on Leave",fn:"leave_phone"},{lb:"Deferred",fn:"deferred"},{lb:"Reason for Deferment",fn:"df_reason"},{lb:"Leave Start(before deferment)",fn:"leave_start_bd_f"},{lb:"Leave End (before deferment)",fn:"leave_end_bd_f"}]
	var hdept=leave[0].hdept;
	if(hdept){
		var icemail=leave[0].icemail
		var incharge=leave[0].incharge
		leave[0].resp=leave[0].hdept_title+" "+leave[0].hdept+" <br><span style='color:blue;font-size:14px'>Acting: "+incharge+", "+icemail+"</span>"
	}
	if(incharge)
		flds[flds.length]={lb:"Responsibility",fn:"resp"}
	var df=leave[0].deferred;
	if(!df)
		flds=remove_arrob(flds,["deferred","df_reason","leave_start_bd_f","leave_end_bd_f"])
	var status=leave[0].ostatus;
	var return_date=leave[0].return_date_f
	var ra=leave[0].return_accepted
	var rdept_id=leave[0].rdept_id;


	if(status=="Pending Approval of Principal"){
		$("#approve-btn,#decline-dl-btn").show()
		if(leave[0].rdept_id==0){
			$("#defer-dl-btn").show()
		}
	}
	else if(status=="Approved by Principal"&&ra==null&&return_date&&rdept_id==0){
		$("#approve-return-btn,#decline-return-dl-btn").show()
	}
	if(status=="Declined by Principal")
		//fr full row; use colspan
		flds.splice(3,0,{lb:"Reason for non-recommendation",fn:"comment",fr:1})
	gen_table_mobile(flds,leave,"leave-details-div",{clms:"2"})
	$("#leave-details-modal").modal("show")
	leave=adata.leaves[index]
	adata.index=index
	adata.id=leave.id
	var file=leave.file;
	if(file)
		$("#download-btn").show()
	else
		$("#download-btn").hide()

	load_leave_approvals(leave)
}

function back_to_view() {
	var index=adata.index;
	view_leave(index)
}
function decline_return_dl() {
	// body...
	$("#comment-div").show()
	$("#leave-details-div,#approval-div").hide()
	$(".leave-btn").hide()
	$("#decline-return-btn").show()
}
function download_file() {
	var id=adata.id;
	var leave=adata.leaves[adata.index]

	window.open("/principal?pg=leave&rq=download-file&id="+id+"&leave_type="+leave.leave_type+"&recorded="+leave.recorded,"_blank")
}
function defer_dl() {
	$("#defer-div").show()
	$("#leave-details-div,#approval-div,#comment-div").hide()
	$(".leave-btn").hide()
	$("#defer-btn").show()
}
function defer_leave() {
	var index=adata.index;
	var id=adata.leave_id
	var leave_start_df=format_day("ls");//deferred
	var flds=[{lb:"Date deferred to",vl:leave_start_df,ft:"date"}]
	var vr=check_empty(flds)
	if(!vr)
		return 0;
	var df_reason=$("#df_reason").val()
	if(df_reason.length==0){
		return display_err("Please enter a reason for deferring this application.")
	}
	
	var status="Approved by Principal"
	var data={url:adata.url,rq:"change-leave-status",status:status,id:id,df_reason:df_reason,deferred:"Yes"}
	var leave=adata.leaves[index]
	data.dur=leave.dur;
	data.leave_start=format_day(0,"format",leave.leave_start)
	data.leave_start_df=leave_start_df//leave start bef
	data.leave_end_df=adata.leave_end;
	data.leave_type=leave.leave_type
	data.leave_id=id;
	data.df_reason=df_reason
	data.hdept_id=adata.hdept_id;
	data.icuserid=adata.icuserid;
	ajax_go(data,function (rst) {
		show_div("leave-card")
		load_leaves(rst)
		$(".modal").modal("hide")
	})
}
function get_leave_end_live() {
	var dur=adata.dur;
	var leave_start=format_day("ls");


	if(leave_start.length==0){
		adata.leave_end=""
		$("#leave_end").val("")
		return 0
	}
	var leave_type=adata.leave_type
	get_leave_end(dur,leave_start,leave_type)
}
function approve_leave() {
	var index=adata.index;
	var leave=adata.leaves[index]
	var id=adata.leaves[index].id;
	var status="Approved by Principal"
	var data={url:adata.url,rq:"change-leave-status",status:status,id:id}
	data.dur=leave.dur;
	data.leave_start=format_day(0,"format",leave.leave_start_bd);
	data.leave_end=format_day(0,"format",leave.leave_end_bd);
	data.leave_type=leave.leave_type
	data.email=leave.email;
	data.applicant=leave.applicant;
	data.hdept_id=adata.hdept_id;
	data.icuserid=adata.icuserid;
	data.userid=adata.userid;

	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("leave-card")
		$(".modal").modal("hide")
		load_leaves(rst)
	})
}

function decline_request_dl() {
	$(".leave-btn").hide()
	$("#decline-btn").show()
	$("#comment-div").show()
	$("#leave-details-div,#approval-div").hide()
}
function decline_request() {
	index=adata.index
	var leave=adata.leaves[index]
	var index=adata.index;
	var id=adata.leaves[index].id;

	var comment=$("#comment").val()
	if(comment.length==0){return display_err("Please enter a reason for declining the application")}
	var status="Declined by Principal"
	var data={url:adata.url,rq:"change-leave-status",status:status,id:id,comment:comment}
	data.dur=leave.dur;
	data.leave_start=leave.leave_start;
	data.leave_type=leave.leave_type
	data.email=leave.email;
	data.applicant=leave.applicant;
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("leave-card")
		load_leaves(rst)
		$(".modal").modal("hide")
	})
}
function cancel_leave(index) {
	var leave=adata.leaves[index]
	var id=adata.leaves[index].id;
	var status=adata.leaves[index].id;

	var status="Cancelled"
	if(status!="Cancellation Requested")
		return display_err("Staff did not request cancellation")
	cfm=alert("Confirm leave cancellation")
	if(!cfm)
		return 0;
	var data={url:adata.url,rq:"change-leave-status",status:status,id:id}
	data.dur=leave.dur;
	data.leave_start=leave.leave_start;
	data.leave_type=leave.leave_type
	ajax_go(data,function (rst) {
		adata.projects=rst.projects;
		show_div("leave-card")
		load_leaves(rst)
	})
}