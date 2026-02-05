var pg="logs"
adata.pg=pg
$(function(){
	get_lglogs()
})

function get_lglogs_def(crit){
	adata.crit=crit;
	if(crit=="all"){
		adata.crit=0;
	}
	get_lglogs()
}
function get_lglogs(pager) {
	if(pager=="next")
    var os=adata.os+lm;
  else if(pager=="previous")
      var os=adata.os-lm;
  else{
      var os=0;
  }

	var data=prep_data([])
	data.rq="get-lglogs"
	data.os=os;
	if(adata.crit)
		data.crit=adata.crit;
	data.name=$("#name").val()
	ajax_go(data,function (rst) {
		load_lglogs(rst)
	})
}

function load_lglogs(rst) {
	var lglogs=rst.lglogs;
	adata.lglogs=lglogs;
	pager("lglogs",rst.os,rst.staff,rst.count)
	var hd=[{lb:"User",fn:"name"},{lb:"Email",fn:"email"},{lb:"Time",fn:"recorded"},{lb:"Status",fn:"status"},{lb:"Agent",fn:"uagent",width:450},{lb:"Activity",text:"View Activity",ft:"btn",oc:"get_activity"}]
	gen_table(hd,lglogs,"lglogs-div","No logs added")
}
function get_activity(i){
	var userid=adata.lglogs[i].id;
	var name=adata.lglogs[i].name;
	var data=prep_data([])
	data.rq="get-activity"
	data.userid=userid;
	ajax_go(data,function (rst) {
		load_activity(rst)
		$("#logs-modal").modal("show")
		$("#lg-name").text(name)
	})
}
function load_activity(rst) {
	var logs=rst.logs;
	adata.logs=logs;
	//pager("logs",rst.os,rst.logs,rst.count)
	var hd=[{lb:"Activity",fn:"message"},{lb:"Time",fn:"ltime"}]
	gen_table(hd,logs,"logs-div","No activity by this user")
}