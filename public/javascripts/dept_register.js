adata.pg="register"
$(function () {
	get_defaults()
})
var adata2={}
function get_defaults() {
	var data=prep_data([])
	data.rq="get-defaults"
	ajax_go(data,function (rst) {
		var flds=JSON.stringify(rst.flds)
		adata2.flds=flds;
		adata.flds=rst.flds;
		
		adata.catid=rst.asscats[0].id;
		load_cat_fields(rst)
		load_assets(rst)
		load_select(rst.depts,"id","dept",".dept")

	})
}
function get_cat_flds(id) {
	adata.catid=id;
	var data=prep_data([])
	data.rq="get-cat-fields"
	data.catid=id;
	ajax_go(data,function (rst) {
		load_cat_fields(rst)
		load_assets(rst)
	})
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
			inp="<textarea class='form-control uppercase' type='text' id=\""+id+"\"></textarea>"
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

function new_asset_dl() {
	clear_fields()
	$("#asset-reg-modal").modal("show")
	var catid=adata.catid
	var flds=adata.flds
	adata.rq="register-asset"
	$("#remove-btn,#to-head-btn,#transfer-btn,#ctransfer-btn").hide()
	$("#register-btn").show()
	load_cat_fields({flds:JSON.parse(adata2.flds)})
}
function get_assets(axn) {
	var data=prep_data([])
	data.rq="get-assets"
	data.crit=adata.crit;
	ajax_go(data,function (rst) {
		load_assets(rst)
		adata.crit=0;
	})
}

function load_assets(rst) {
	var assets=rst.assets;
	adata.assets=assets
	var hd=rst.flds;
	var flds=JSON.stringify(hd)
	adata2.flds=flds;
	var before=hd[0].fn;
	hd=fix_arrob(hd,{lb:"",fn:"edit"},before)
	var before=hd[1].fn;
	hd=fix_arrob(hd,{lb:"Approval Status",fn:"status"},before)
	for(var i=0;i<assets.length;i++){
		assets[i].edit="<button class='btn btn-primary btn-sm' style='width:70px' onclick=\"edit_asset("+i+")\"><i class='fa fa-edit'></i> "+(i+1)+"</button>"
	}
	gen_table(hd,assets,"assets-div","No assets added")
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
	var data=prep_data(hd)
	if(!data)
		return 0;
	data.catid=adata.catid

	data.rq=adata.rq
	data.assid=adata.assid
	data.arid=adata.arid;
	ajax_go(data,function (rst) {
		load_assets(rst)
		$(".modal").modal("hide")
	})
}
function edit_asset(index) {
	adata.index=index
	clear_fields()
	var hd=adata.flds;
	var assets=adata.assets
	adata.assid=assets[index].assid;
	adata.arid=assets[index].id
	var status=assets[index].status;
	var transferred=assets[index].transferred

	$("#ctransfer-btn,#transfer-btn,#transfer-div").hide()
	$("#cat-flds-div").show()
	if(status=="Not Submitted"||status=="Declined by HOD"||status=="Declined by S&P"){
		dsb=false;
		$("#remove-btn,#to-head-btn,#register-btn").show()
	}
	else{
		dsb=true;
		$("#remove-btn,#to-head-btn,#register-btn").hide()
	}
	if(status=="Approved by S&P")
		$("#transfer-btn").show()
	$("#asset-reg-modal").modal("show")
	if(transferred==1){
		dsb=true;
		$("#remove-btn").hide()
	}
	var odsb=dsb;

	for(var i=0;i<hd.length;i++){
		var fn=hd[i].fn;
		var ft=hd[i].ft;
		var cx=hd[i].cx

		val=assets[index][fn]
		if(ft=="date"){
			$("#"+fn+"_year").attr("disabled",dsb)
			$("#"+fn+"_month").attr("disabled",dsb)
			$("#"+fn+"_day").attr("disabled",dsb)
			format_day(fn,"edit",val,dsb)
		}
		else
			$("#"+fn).val(val)
		adata.rq="edit-asset"
		$("#"+fn).attr("disabled",dsb)

		if(transferred&&cx&&(status=="Not Submitted"||status=="Declined by HOD"||status=="Declined by S&P")){
			dsb=false;
			
			$("#"+fn).attr("disabled",dsb)
		}
		dsb=odsb;//original disable

		
	}
	
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
function submit_to_head() {
	i=adata.index;
	var cfm=confirm("Are you sure you want to submit to head?")
	if(!cfm)
		return 0
	var id=adata.assets[i].id;
	var assid=adata.assets[i].assid
	data=prep_data([])
	if(!data)
		return 0;
	data.catid=adata.catid
	data.rq="submit-to-head"
	data.arid=id;//asset registration ID
	adata.assid=assid
	ajax_go(data,function (rst) {
		load_assets(rst)
		$(".modal").modal("hide")
	})
}
function transfer_asset_dl() {
	$("#cat-flds-div,#transfer-btn").hide()
	$("#transfer-div,#ctransfer-btn").show()
}
function transfer_asset() {
	i=adata.index;
	var id=adata.assets[i].id;
	var assid=adata.assets[i].assid

	data=prep_data([{lb:"Department",fn:"tdept_id",ft:"sel"},{lb:"Transfer Reason",fn:"transfer_reason"}])
	if(!data)
		return 0;
	data.catid=adata.catid
	data.assid=assid
	data.rq="tranfer"
	data.arid=id;//asset registration ID
	adata.assid=assid
	data.reg_id=id
	var iuserid=get_incharge()
	if(!iuserid)
		return 0
	data.iuserid=iuserid
	var cfm=confirm("Are you sure you want to tranfer the asset?")
	if(!cfm)
		return 0

	ajax_go(data,function (rst) {
		load_assets(rst)
		$(".modal").modal("hide")
	})
}

function get_users(pager) {
	if(pager=="next")
        var os=adata.os+lm;
    else if(pager=="previous")
        var os=adata.os-lm;
    else if(pager=="reset"){
    	adata.crit="all"
    	var os=0;
    }
    else{
        var os=0;
    }
    var crit="by-name";
	var data={rq:"get-users",url:adata.url,os:os,crit:crit}
	if(crit=="by-name"){
			var name=$("#dept-user-search-name").val()
			if(name.length==0){return display_err("Please enter a name or email before you search")}
			data.name=name;
    }
	ajax_go(data,function (rst) {

		load_users(rst)
	})
}
function load_users(rst) {
	 pager("search-users",rst.os,rst.users,rst.count)
	adata.users=rst.users;
	var users=rst.users;
	$("#dept-users-search-div").show()
	if(users.length)
			$("#dept-users-footer,#dept-users-search-div").show()
	else
			$("#dept-users-footer").hide()
	var flds=[{lb:"",ft:"rb",cl:"dept-user-rb",fn:"id"},{lb:"Name",fn:"name"},{lb:"Email",fn:"email"}]
	gen_table(flds,users,"dept-user-search-results","No results retrieved")
}

function get_incharge() {
	var dept_users=$(".dept-user-rb");var userid=0;//userid
	dept_users.each(function () {
		var id=this.value
		var checked=$(this)[0].checked

		if(checked){
			userid=id;
		}
	})
	if(!userid){
		display_err("Please select one who will be incharge of the asset")
		return 0;
	}
	return userid
}