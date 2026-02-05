function get_tnas(status) {
	data={url:adata.url,rq:"get-tnas",status:status}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_tnas(rst)
	})
}
function load_tnas(rst) {
	$("#tnas-card").show()
	$("#tna-response-card").hide()
	var flds=[{lb:"Creation Date",fn:"created"},{lb:"Department",fn:"dept"},{lb:"Filled by ",fn:"headname"},{lb:"Status",fn:"status_f"},{lb:"Submission Date",fn:"submitted"},{lb:"",ft:"btn",oc:"goto_tna",text:"Go to TNA"}]
	var tnas=rst.tnas;

	for(var i=0;i<tnas.length;i++){
		var rem=""
		
		if(tnas[i].status=="Not Submitted"){

			rem="<button class='btn btn-danger btn-sm' onclick=\"remove_tna("+i+")\"><i class='fa fa-trash'></i></button>"
		}
		
		tnas[i].status_f=tnas[i].status+" "+rem
		
	}
	
	adata.tnas=tnas;
	gen_table(flds,tnas,"tnas-div","No Training needs assessments forms")
}
function remove_tna(i) {
	var tnaid=adata.tnas[i].id;
	adata.tnaid=tnaid
	data={url:adata.url,rq:"remove-tna",tnaid:tnaid}
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_tnas(rst)
	})
}
function goto_tna(i) {
	var tnaid=adata.tnas[i].id;
	var status=adata.tnas[i].status
	adata.tnaid=tnaid
	adata.status=status;
	load_tna_hdr(i)
	data={url:adata.url,rq:"get-tna-responses",status:status,tnaid:tnaid}
	ajax_go(data,function (rst) {
		adata.me=rst.user

		load_tna_responses(rst)
	})
}
function load_tna_hdr(i) {
	var dept=adata.tnas[i].dept;
	var name=adata.tnas[i].headname;
	var faculty=adata.tnas[i].pdept;
	if(!faculty)
		faculty="#N/A"
	$("#lrespondent").text(name)
	$("#ldept").text(dept)
	$("#lfaculty").text(faculty)
}
function load_tna_responses(rst) {
	var questions=rst.questions;
	adata.questions=questions;
	$("#tnas-card").hide()
	$("#tna-response-card").show()
	$(".save-btn,.submit-btn").hide()
	if(adata.status=="Not Submitted"){
		$(".save-btn,.submit-btn").show()
	}
	var status=adata.status;
	var dv="<div>"
	for(var i=0;i<questions.length;i++){
		var qn=questions[i].question;
		var res=questions[i].response;
		var qt=questions[i].type;
		var qid=questions[i].id;

		
		if(qt=="tp"){

			dv+="<p>"+qn+"</p>"
			//typed
			
			if(res&&res.length){

			}
			else
				res=""

			if(adata.status=="Not Submitted")
				dv+="<textarea class='form-control' id=qr-"+i+">"+res+"</textarea>"
			else
				dv+="<p style='background:#C6F4D6;border-radius:3px;padding:10px'>"+res+"</p>"
		}
		else if(qt=="lb"){
			
			dv+="<p>"+qn+"</p>"
			var hd=questions[i].hd.split("__");//spit double underscore
			var tb="<table class='table'><tr>"
			for(var k=0;k<hd.length;k++){
				tb+="<th>"+hd[k]+"</th>"
			}
			tb+="</tr>"
			for(var j=0;j<questions.length;j++){
				var res=questions[j].response;
				if(questions[j].pqid!=qid){
					continue;
				}
				if(adata.status=="Not Submitted")
					dsb=""
				else
					dsb="disabled"
				tb+="<tr><td>"+questions[j].question+"</td><td>"+load_radio(j,res,dsb)+"</td></tr>"
				
			}


			dv+=tb+"</table>"
		}
	}

	dv+="</div>"
	
	$("#tna-response-div").html(dv)

}
function load_radio(index,response,dsb) {
	if(!dsb)
		dsb=""
	var ops=["Extreme","High","Moderate","Low","Not Applicable"]
	var tb="<table style='width:300px'>"
	
	for(var m=0;m<ops.length;m++){
		checked="";
		if(response==ops[m])
			checked="checked='checked'";

		tb+="<tr><td style='text-align:center'><input style='width:25px;height:25px;vertical-align:center' "+dsb+" "+checked+" type='radio' value='"+ops[m]+"' name=\"rb-"+index+"\"></td><td>"+ops[m]+"</td></tr>"
	}
	tb+="</table>"
	return tb;
}