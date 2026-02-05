adata.pg="register"
$(function () {
	get_defaults()
})
function filter_dl(argument) {
	$("#filter-modal").modal("show")
}
function ttcost_dl(argument) {

	$("#ttcost-modal").modal("show")
}
function asset_cond_report_dl(argument) {

	$("#asset-cond-modal").modal("show")
}

function get_asset_cond_report() {
	adata.rq="get-cond-report"

	var data=prep_data([{lb:"Department",fn:"dept_id_cond",ft:"sel",rfn:"dept_id"},{lb:"Category",fn:"cond_catid",rfn:"catid"}]);if(!data){return 0};
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_cond_report(rst)
	})
}
function download_asset_cond_report() {
	adata.rq="get-cond-report"

	var data=prep_data([{lb:"Department",fn:"dept_id_cond",ft:"sel",rfn:"dept_id"},{lb:"Category",fn:"cond_catid",rfn:"catid"}])
	if(!data){return 0}
	data.pg=adata.pg;
	data.download=1
	data.status=adata.status
	var dx=""
	for(const key in data){
		dx+="<input type='hidden' name=\""+key+"\" value=\""+data[key]+"\">"
	}
	$("#dlform").html(dx)
	$("#dlform").submit()
	
	
}


function load_cond_report(rst) {
	var srep=rst.rep;
	var cats=rst.cats;
	
	var repy=[]
	var k=0;
	for(var i=0;i<cats.length;i++){
		repy[i]={cat:cats[i].details,good:0,fair:0,tobedisposed:0,disposed:0,dueformaintenance:0}
		for(var j=0;j<srep.length;j++){
			if(srep[j].details==cats[i].details&&srep[j].cond.toUpperCase()=="GOOD CONDITION"){
				repy[i].good+=srep[j].tcount;
			}
			if(srep[j].details==cats[i].details&&srep[j].cond.toUpperCase()=="FAIR CONDITION"){
				repy[i].fair+=srep[j].tcount;
			}
			if(srep[j].details==cats[i].details&&srep[j].cond.toUpperCase()=="TO BE DISPOSED OFF"){

				repy[i].tobedisposed+=srep[j].tcount;
			}
			if(srep[j].details==cats[i].details&&srep[j].cond.toUpperCase()=="DISPOSED"){

				repy[i].disposed+=srep[j].tcount;
			}
			if(srep[j].details==cats[i].details&&srep[j].cond.toUpperCase()=="DUE FOR MAINTENANCE/REPAIR"){
				repy[i].dueformaintenance+=srep[j].tcount;
			}
		}
		
	}
	
	var tb=""

	var hd=[{lb:"Asset",fn:"cat"},{lb:"GOOD CONDITION",fn:"good"},{lb:"FAIR CONDITION",fn:"fair"},{lb:"TO BE DISPOSED OFF",fn:"tobedisposed"},{lb:"DISPOSED",fn:"disposed"},{lb:"DUE FOR MAINTENANCE/REPAIR",fn:"dueformaintenance"}]
	gen_table(hd,repy,"assets-div","Nothing to Display")
}
function get_defaults() {
	var data=prep_data([])
	data.rq="get-defaults"
	ajax_go(data,function (rst) {
		var items=rst.items
		//load_assets(rst)
		var before=rst.depts[0].dept;
		adata.catid=rst.catid
		var depts=fix_arrob(rst.depts,{id:"all",dept:"All Departments"},before,"dept")

		before=depts[1].dept;
		
		depts=fix_arrob(depts,{id:"without",dept:"Without"},before,"dept")
		load_select(rst.asscats,"id","cat",".catid")
		load_select(depts,"id","dept",".dept")
		load_asset_report(rst)
		adata.ftarr=[]
	})
}
function download_register(rt) {
	adata.rq="download-assets"
	if(rt=="all"){
		var data=prep_data([{lb:"Department",fn:"dept_id",ft:"sel",vl:"all"}])
		adata.status="Approved by S&P"
		var ftarr=[]
	}
	else{
	
		var data=prep_data([{lb:"Asset Category",fn:"catid"},{lb:"Department",fn:"dept_id",ft:"sel"}])
		var flds=adata.flds;
		var ftarr=[];var k=0
		for(var i=0;i<flds.length;i++){
			var fn=flds[i].fn;
			val=$("#flt-"+fn).val()
			if(val.length){
				ftarr[k++]={fn:fn,val:val}
			}
		}
	}
	if(!data){return 0}
	
	
	adata.ftarr=ftarr;

	data.pg=adata.pg;
	data.download=1
	data.status=adata.status
	var dx=""
	for(const key in data){
		dx+="<input type='hidden' name=\""+key+"\" value=\""+data[key]+"\">"
	}
	
	dx+="<input type='hidden' name=\"ftarr\" value=\'"+JSON.stringify(adata.ftarr)+"\'>"
	$("#dlform").html(dx)
	$("#dlform").submit()
}

function load_asset_report(rst) {
	var rep=rst.rep;
	var tb=""
	for(var i=0;i<rep.length;i++){
		var dept=rep[i].dept;
		var dept_id=rep[i].dept_idx
		rep[i].dept="<span class='text-success' style='cursor:pointer' onclick=\"get_dept_cat_rep("+dept_id+",\'"+dept+"\')\">"+dept+"</span>"
	}
	var hd=[{lb:"Department",fn:"dept"},{lb:"Approved",fn:"no1"},{lb:"Pending",fn:"no2"},{lb:"Declined",fn:"no3"}]
	gen_table(hd,rep,"assets-div",{nmsg:"Nothing to Display",tclass:"table table-bordered"})

}

function get_dept_cat_rep(dept_id,dept) {
	var data=prep_data([])
	data.rq="get-dept-cat-rep"
	data.dept_id=dept_id
	adata.dept_id=dept_id
	adata.dept=dept+", "
	ajax_go(data,function (rst) {
		$("#status-hdr").text("Assets for "+dept)
		$("#back-btn").show()
		load_dept_cat_rep(rst)
	})
}
function get_ttcost_report() {
	var data=prep_data([])

	data.rq="get-ttcost-report"
	data.dept_id=$("#dept_id_tt").val()
	data.condition=$("#condition_tt").val()
	ajax_go(data,function (rst) {
		$(".modal").modal("hide")
		load_ttcost_report(rst)
	})
}
function load_ttcost_report(rst) {
	var rep=rst.rep;
	
	//$("#status-table").hide()
	for(var i=0;i<rep.length;i++){
		var catid=rep[i].catidx;
		var cat=rep[i].cat;
		
	}
	var tb=""
	var hd=[{lb:"Category",fn:"cat"},{lb:"Count",fn:"tcount"},{lb:"Total Cost",fn:"tcost",ft:"money"}]
	gen_table(hd,rep,"assets-div","Nothing to Display")
}
function go_back() {
	$("#approve-btn-many,#decline-btn-many").hide()
	if(adata.baxn=="assets"){

		$("#back-btn").show()
		get_dept_cat_rep(adata.dept_id,adata.dept)

	}
	else{
		$("#status-hdr").text("")
		$("#back-btn").hide()

		get_defaults()
	}
}

function load_dept_cat_rep(rst) {
	var rep=rst.rep;
	adata.baxn="cat"//back action
	$("#status-table").hide()
	for(var i=0;i<rep.length;i++){
		var catid=rep[i].catidx;
		var cat=rep[i].cat;
		
	}
	var tb=""
	var hd=[{lb:"Category",fn:"cat"},{lb:"Approved",fn:"no1"},{lb:"Pending",fn:"no2"},{lb:"Declined",fn:"no3"}]
	gen_table(hd,rep,"assets-div","Nothing to Display")
}
function get_assets_by_cat(catid) {
	adata.catid=catid;
	get_assets()
	adata.baxn="assets"
}
function new_asset_dl() {
	clear_fields()
	$("#asset-reg-modal").modal("show")
	var catid=adata.catid
	var flds=adata.flds
	adata.rq="register-asset"
	adata.assets=0
	$("#remove-btn").hide()
	$("#row-a").show()
	$("#row-b").hide()
}
function get_assets_view() {
	adata.catid=$("#catid").val()
	adata.dept_id=$("#dept_id").val()
	adata.dept=""
	adata.view=1;
	var flds=adata.flds;
	var ftarr=[];var k=0
	
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		
		val=$("#flt-"+fn).val()

		if(val.length){
			ftarr[k++]={fn:fn,val:val}
		}
	}
	adata.ftarr=ftarr;


	get_assets()
}
function status_changed() {

	adata.status=$("#status").val()

}

function get_assets(pager) {
	if(pager=="next")
	    var os=adata.os+lm;
	  else if(pager=="previous")
	      var os=adata.os-lm;
	  else{

	      var os=0;
	  }
	var data=prep_data([])
	data.rq="get-assets"
	
	data.catid=adata.catid

	data.dept_id=adata.dept_id
	var status=adata.status;

	//var status=$("#status").val()

	if(status==""||status==0){
		var status="Pending Approval by S&P"
	}
	
	data.status=status
	
	adata.status=status
	data.os=os;
	data.ftarr=JSON.stringify(adata.ftarr);
	ajax_go(data,function (rst) {
		data.status=""

		if(adata.dept_id==0||adata.view==1){
			$("#back-btn").hide()
			$("#status-table").hide()
		}
		else{

			$("#status-table").show()
		}
		adata.view=0;

		load_assets(rst)
		$(".modal").modal("hide")
	})
}
function get_cat_fields(crit) {
	var data=prep_data([])
	data.rq="get-cat-fields"
	if(crit=="select"){
		data.catid=$("#cond_catid").val()

	}
	else
		data.catid=$("#catid").val()
	ajax_go(data,function (rst) {

		if(crit=="select"){
			
			load_select(rst.flds,"fn","lb",".fid")
		}
		else
			load_cat_fields_filter(rst)
	})
}
function load_cat_fields_filter(rst,cb) {
	var flds=rst.flds
	adata.flds=flds;
	var f1=[];var m=0;//fixed fields; in assets register
	var f2=[];var n=0;//non fixed; can change with time
	adata.flds=flds
	var tb="<table class='table'>"
	for(var i=0;i<flds.length;i++){
		var id="flt-"+flds[i].fn;
		var fn=id;
		var cx=flds[i].cx;
		if(cx==1)
			f2[n++]=flds[i]
		else
			f1[m++]=flds[i]
		var ro=""

		var inp="<input class='form-control uppercase' type='text' id=\""+id+"\">"
		var ft=flds[i].ft;//field type
		if(ft=="ops")
		{
			ops=flds[i].ops;
			var ops2=flds[i].ops2
			if(ops2)
				ops=ops2
			if(ops==null)
				ops=""
			
			if(ops.length){
				ops=ops.split(", ")
				inp="<select class='form-select' type='text' id=\""+id+"\"><option></option>"
				for(var k=0;k<ops.length;k++){
					var v=ops[k]
					if(v==" ")
						continue;
					inp+="<option>"+v+"</option>"
				}
				inp+="</select>"
			}
			else{
				inp="<select class='form-select' type='text' id=\""+id+"\"></select>"
			}
		}
		tb+="<tr><td>"+flds[i].lb+"</td><td>"+inp+"</td></tr>"
	}
	tb+="</table>"
	$("#filter-fields-div").html(tb)
}
function load_cat_fields(rst,cb) {
	var flds=rst.flds

	var f1=[];var m=0;//fixed fields; in assets register
	var f2=[];var n=0;//non fixed; can change with time
	adata.flds=flds
	var tb="<table class='table'>"
	for(var i=0;i<flds.length;i++){
		var id=flds[i].fn;
		var fn=id;
		var cx=flds[i].cx;
		if(cx==1)
			f2[n++]=flds[i]
		else
			f1[m++]=flds[i]
		var ro=""
		if(flds[i].fn=="username"||flds[i].fn=="usertitle"){
			ro="readonly=true onclick=\"search_user_dl()\""
		}
		var inp="<input class='form-control uppercase' "+ro+" type='text' id=\""+id+"\">"
		var ft=flds[i].ft;//field type
		if(ft=="ops")
		{
			ops=flds[i].ops;
			var ops2=flds[i].ops2
			if(ops2)
				ops=ops2
			if(ops==null)
				ops=""
			
			if(ops.length){
				ops=ops.split(", ")
				inp="<select class='form-select' type='text' id=\""+id+"\">>"
				for(var k=0;k<ops.length;k++){
					var v=ops[k]
					if(v==" ")
						continue;
					inp+="<option>"+v+"</option>"
				}
				inp+="</select>"
			}
			else{
				inp="<select class='form-select' type='text' id=\""+id+"\">></select>"
			}
		}
		else if(ft=="ta"){
			//textbox
			inp="<textarea class='form-control' type='text' id=\""+id+"\">></textarea>"
		}
		else if(ft=="date"){
			var arr=populate_date(1)
			inp="<table style=\"width:100%\"><tr><td><select class=\"day form-select\" id=\""+id+"_day\">"+arr[0]+"</select></td><td><select class=\"month form-select\" id=\""+id+"_month\">"+arr[1]+"</select></td><td style=\"width:92px\"><input class=\"form-control\" type=\"number\" min=\"1\" id=\""+id+"_year\" /></td></tr></table>"
		}
		tb+="<tr><td>"+flds[i].lb+"</td><td>"+inp+"</td></tr>"
	}
	tb+="</table>"
	$("#cat-flds-div").html(tb)
}
function search_user_dl() {
	$("#cat-flds-div,.modal-footer,#transfer-div").hide()
	$("#asset-user-div,#ctransfer-btn").show()
}
function back_to_cf() {
	$("#ctransfer-btn,#transfer-btn,#transfer-div,#asset-user-div").hide()
	$("#cat-flds-div,.modal-footer").show()
	select_asset_user()
}
function register_asset() {
	var hd=[]
	var hd=adata.flds
	for(var i=0;i<hd.length;i++){
		var ft=hd[i].ft;
		var fn=hd[i].fn
		if(ft=="date"){
			hd[i].vl=format_day(fn)
		}
	}
	if(adata.assets)
	
	var notes="";var k=0;//change array
	if(adata.assets){
		var asset=adata.assets[adata.index]
		for(var fn in asset){
			var nv=$("#"+fn).val()
			var ov=asset[fn]
			for(var j=0;j<hd.length;j++){
				if(hd[j].fn==fn){
					lb=hd[j].lb;
					var ft=hd[j].ft;
					break;
				}
			}
			if(ft=="money")
				nv=nv.split(",").join("")
			if(nv==undefined||nv==ov||(nv==""&&ov==null)){
				continue;
			}
			if(ov==null)
				ov=""
			notes+="<span>"+lb+": "+ov+"->"+nv+"</span><br>"
		}
	}
	else{
		//new asset
		for(var j=0;j<hd.length;j++){
			var nv=$("#"+fn).val()
			
			if(nv==undefined){
				continue;
			}
			notes+="<span>"+lb+":  ->"+nv+"</span><br>"
		}
	}
	
	var data=prep_data(hd)

	if(!data)
		return 0;
	data.catid=adata.catid

	data.rq=adata.rq
	data.assid=adata.assid
	console.log(data.assid)

	data.arid=adata.arid;
	data.ref_contract_id=adata.ref_contract_id;
	data.ref_userid=adata.ref_userid
	data.ref_dept=adata.ref_dept
	data.dept_id=adata.dept_id
	if(notes.length)
		data.notes=notes;
	if(adata.status)
		data.status=adata.status

	ajax_go(data,function (rst) {
		load_assets(rst)
		adata.status=rst.status
		$(".modal").modal("hide")
	})
}
function remove_asset() {
	i=adata.index;
	var cfm=confirm("Are you sure you want to delete?")
	if(!cfm)
		return 0
	var id=adata.assets[i].id;
	var assid=adata.assets[i].assid
	data=prep_data([])
	if(!data)
		return 0;
	data.catid=adata.catid
	data.rq="remove-asset"
	data.arid=id;//asset registration ID
	adata.assid=assid
	ajax_go(data,function (rst) {
		load_assets(rst)
		$(".modal").modal("hide")
	})
}
function load_assets(rst) {
	$("#status-hdr").text(adata.dept+rst.status)
	load_cat_fields(rst)
	var assets=rst.assets;
	adata.assets=assets
	pager("assets",rst.os,assets,rst.count)
	var status=rst.status

	if(assets.length&&rst.status=="Pending Approval by S&P"){
		$("#approve-btn-many,#decline-btn-many").show()
	}
	else{
		$("#approve-btn-many,#decline-btn-many").hide()
	}
	var hd=rst.flds;
	
	for(var i=0;i<assets.length;i++){
		assets[i].cbtn="<button class='btn btn-primary btn-sm' style='width:50px' onclick=\"+edit_asset("+i+")\"> "+(i+1)+"<i class='fa fa-edit'></i></button>"
		if(status=="Pending Approval by S&P"){
			assets[i].sbtn="<input type='checkbox' style='width:25px;height:25px' value="+assets[i].id+" class='acb'>"
		}
	}
	var pen=0;
	var before=hd[0].fn;
	if(status=="Pending Approval by S&P"){
		hd=fix_arrob(hd,{lb:"<input type='checkbox' style='width:25px;height:25px' onclick=\"check_all('acb',this)\">",fn:"sbtn"},before)
		pen=1;	
		
	}
	if(pen)
		n=1
	else
		n=0
	
	var before=hd[n].fn;
	hd=fix_arrob(hd,{lb:"",fn:"cbtn"},before)
	var before=hd[n+1].fn;
	hd=fix_arrob(hd,{lb:"Department",fn:"dept"},before)
	var before=hd[n+2].fn;
	hd=fix_arrob(hd,{lb:"Reg. By",fn:"reg_user"},before)
	gen_table_sticky(hd,assets,"assets-div","No assets to display")
}
function take_axn_dl() {
	
}


function edit_asset(index) {
	adata.index=index
	clear_fields()
	var hd=adata.flds;
	var assets=adata.assets
	adata.assid=assets[index].assid;

	adata.arid=assets[index].id
	var dsb=false;
	$("#edit-hist-btn,#remove-btn,#register-btn,.modal-footer").show()
	var status=assets[index].status

	adata.status=status
	$("#approve-btn,#decline-btn").hide()

	$("#asset-user-div").hide()
	$("#asset-reg-modal").modal("show")

		for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		var ft=hd[i].ft;

		val=assets[index][fn]
		if(ft=="date"){
			format_day(fn,"edit",val)
			$("#"+fn+"_year").attr("disabled",dsb)
			$("#"+fn+"_month").attr("disabled",dsb)
			$("#"+fn+"_day").attr("disabled",dsb)
		}
		if(ft=="money"){
			$("#"+fn).attr("disabled",dsb)
			$("#"+fn).val(cx(val))
		}
		else{
			$("#"+fn).attr("disabled",dsb)
			$("#"+fn).val(val)
		}
		adata.rq="edit-asset"
		
	}
	//$("#remove-btn").show()
	$("#row-a").show()
	$("#row-b").hide()
}

function approve_asset(tp) {
	
	if(!tp){
		//single approval
		i=adata.index;
		var id=adata.assets[i].id;
		var assid=adata.assets[i].assid
		var arid=adata.assets[i].id
	}
	else{
		//many assets
		var arid=[];var k=0
		$(".acb").each(function (i) {
			var cv=this.checked
			
			if(cv==true)
				arid[k++]=this.value;
		})
	}
	if(arid.length==0){
		return display_err("Please select atleast one asset")
	}
	data=prep_data([])
	if(!data)
		return 0;
	var cfm=confirm("Confirm approval?")
	if(!cfm)
		return 0
	data.rq="change-asset-status"
	data.status="Approved by S&P"
	data.arid=arid;//asset registration ID
	
	data.catid=adata.catid
	data.dept_id=adata.dept_id
	ajax_go(data,function (rst) {
		load_assets(rst)

		$(".modal").modal("hide")
	})
}

function view_edit_hist() {
	data=prep_data([])
	if(!data)
		return 0;
	data.rq="get-edit-hist"
	data.assid=adata.assid;
	data.catid=adata.catid
	data.dept_id=adata.dept_id
	ajax_go(data,function (rst) {
		load_edit_hist(rst)
		$(".modal").modal("hide")
	})
}
function load_edit_hist(rst) {
	var hist=rst.hist;
	var hd=[{lb:"User",fn:"name"},{lb:"Time",fn:"edit_time"},{lb:"Change Made",fn:"notes"}]
	gen_table(hd,hist,"edit-hist-div")
	$("#edit-hist-modal").modal("show")
}
function decline_asset_dl() {
	$("#row-a").hide()
	$("#row-b").show()
}

function close_decline(argument) {
	$("#row-a").show()
	$("#row-b").hide()
}

function decline_assets_dl() {
	$("#decline-assets-modal").modal("show")
	$("#msg,#msg2").text("")
}

function decline_asset(tp) {
	if(!tp){
		i=adata.index;
		var id=adata.assets[i].id;
		var assid=adata.assets[i].assid
		var arid=id;//asset registration ID
		data=prep_data([{fn:"msg",lb:"Message"}])
	}
	else{
		var arid=[];var k=0
		$(".acb").each(function (i) {
			var cv=this.checked

			if(cv==true)
				arid[k++]=this.value;
		})
		data=prep_data([{fn:"msg2",lb:"Message"}])
	}
	if(arid.length==0){
		return display_err("Please select atleast one asset")
	}
	if(!data)
		return 0;
	var cfm=confirm("Confirm?")
	if(!cfm)
		return 0
	data.catid=adata.catid
	data.rq="change-asset-status"
	data.status="Declined by S&P"
	data.arid=arid;//asset registration ID
	data.dept_id=adata.dept_id
	ajax_go(data,function (rst) {
		load_assets(rst)
		$(".modal").modal("hide")
	})
}

function upload_dl() {
	$("#upload-modal").modal("show")
}

function attach_file() {
	$("#reg_file_name").hide()
	 $("#upload-btn").hide()
	 $("#reg_file").val("")
	$("#reg_file").trigger("click")
	adata.rq="upload-register"
}

function reg_file_changed() {
	var doc=document.getElementById("reg_file").files
  var vi=validate_file(doc,"excel")
  if(!vi)
    return 0;
  var fd=new FormData()

  $("#reg_file_name").show()
  $("#upload-btn").show()
  return $("#reg_file_name").text(doc[0].name)
}

function upload_register() {
	
	flds=[{lb:"Category",fn:"catid_up",rfn:"catid"},{lb:"Department",fn:"dept_id_up",rfn:"dept_id"},]
	
	var data=prep_data(flds,"post");if(!data){return 0}
	var file=document.getElementById("reg_file").files
	if(file.length){
		var vr=validate_file(file,"excel");if(!vr){return 0;}
	}
	if(file.length==0){return display_err("Please attach an excel file")}
	data.append("reg_file",file[0])
	ajax_file(data,function (rst) {
		$(".modal").modal("hide")
		load_asset_report(rst)
		
	})
}