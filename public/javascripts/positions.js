adata.pg="designations"
//////*****POSITIONS*********//
$(function () {
	get_psns()
})
function get_psns() {
	var data={url:adata.url,rq:"get-psns"}
	ajax_go(data,function (rst) {
		show_div("psns-card")
		load_psns(rst)
	})
}
function new_psn_dl() {
	clear_fields()
	adata.rq="add-psn"
	$("#psn-modal").modal("show")
}
function add_psn() {
	var psn=$("#psn").val()
	var cat=$("#psn-cat").val()
	var role=$("#psn-role").val()
	
	if(psn.length==0)
		return 0;
	var data={url:adata.url,psn:psn,rq:adata.rq,id:adata.id}
	ajax_go(data,function (rst) {
		adata.psn=rst.psn;
		show_div("psns-card")
		load_psns(rst)
		$("#psn-modal").modal("hide")
	})
}

function load_psns(rst) {
	var psns=rst.psns;
	load_select(psns,"id","psn",".psn")
	adata.psns=psns;
	var flds=[{lb:"#",ft:"serial"},{lb:"Designation",fn:"psn"},{lb:"",ft:"options"}]
	var options=[{text:"Edit",method:"edit_psn"},{text:"Remove",method:"remove_psn"}]
	gen_table(flds,psns,"psns-div","No positions added",options)
}
function edit_psn(index) {
	var psn=adata.psns[index].psn;
	var cat=adata.psns[index].cat;
	$("#psn").val(psn)
	$("#psn-cat").val(cat)
	$("#psn-role").val(adata.psns[index].role)
	adata.rq="edit-psn"
	adata.id=adata.psns[index].id;
	$("#psn-modal").modal("show")
}
function remove_psn(index) {
	var id=adata.psns[index].id;
	var data={url:adata.url,rq:"remove-psn",id:id}
	ajax_go(data,function (rst) {
		load_psns(rst)
	})
}
