adata.pg="sdp"
$(function () {
	get_default()
	populate_cs_day()
})
function get_default() {
	data={url:adata.url,rq:"get-default"}

	ajax_go(data,function (rst) {
		load_sdps(rst)

		adata.cdate=rst.cdate;
		adata.me=rst.user
		adata.cyear=rst.cyear
		$("#ls_year").val(rst.cyear)
		$("#ls_year").attr("min",rst.cyear)
		$("#ls_year").attr("max",rst.cyear+1)
		var quals=rst.acad_bg
		adata.quals=quals
		for(var i=0;i<quals.length;i++){
			quals[i].qual=quals[i].award+"||"+quals[i].school+"|| "+quals[i].end_year
		}
		load_select(quals,"id","qual","#qid")
		show_contract_details()
		
	})
}
function get_sdps(status) {
	data={url:adata.url,rq:"get-sdps",status:status}
	ajax_go(data,function (rst) {
		load_sdps(rst)
	})
}

function new_sdp_dl() {
	adata.rq="add-sdp"
	if(adata.elig==0){
		return display_err("You have a pending SDP")
	}
	get_rdept_ns()
	//return $("#new-cra-modal").modal("show")//*******************************************************************************************
	var ps=check_profile_status(data)
	if(ps!=1)
		return 0
	var sdps=adata.sdps;
	$("#new-sdp-modal").modal("show")
	adata.rq="add-sdp"
	clear_fields()
	
}

function check_profile_status() {
	var cdate=moment(adata.cdate);
	var end=moment(adata.me.contract_ends);
	var diff=moment.duration(end.diff(cdate));
	diff=diff.asDays();
	if(adata.me.status=="Declined"){
		return display_err("Your profile status was declined")
	}
	else if(adata.me.pstatus=="Not submitted"){
		return display_err("Your profile has not been submitted for approval")
	}
	else if(adata.me.pstatus=="Pending"){
		return display_err("Your profile is still pending approval")
	}
	else if(adata.me.fpsn==null){
		return display_err("SDP requires that you add your first appointment information. Go to the biodata section and add it.")
	}

	else
		return 1;
}



function submit_sdp(axn) {
	var cra_start=format_day("ls")
	var quals=adata.quals;
	var qid=$("#qid").val();
	if(qid.length==0||qid=="0"){
		return display_err("Please fill in your current qualification")
	}
	for(var i=0;i<quals.length;i++){
		var id=quals[i].id;
		if(id==qid){
			var qualification=quals[i].award;
			var award_year=quals[i].end_year
			var award_institution=quals[i].school;
			break;
		}
	}
	var flds=[{lb:"Study Status",fn:"study_status"},{lb:"Qualification",fn:"qualification",vl:qualification},{lb:"Award Year",fn:"award_year",vl:award_year},{lb:"Institution of Award",fn:"award_institution",vl:award_institution},{lb:"Study Program",fn:"program"},{lb:"Place of Study",fn:"place_of_study"},{lb:"Year of Commencement",fn:"start_year"},{lb:"Expected year of completion",fn:"end_year"},{lb:"Tuition Source",fn:"tuition_source"},{lb:"Tution per Year",fn:"tuition_per_year",ft:"money"},{lb:"Other Fees",fn:"other_fees",ft:"money"}]
	var data=prep_data(flds,"post")

	if(!data)
		return 0;
	data.append("status","Pending Approval of Supervisor");
	data.append("rdept_id",adata.rdept_id);//email department
	data.append("hdept_id",adata.hdept_id)
	data.append("axn",axn)
	data.append("crid",adata.crid)
	ajax_file(data,function (rst) {
		$("#new-sdp-modal").modal("hide")
		load_sdps(rst)
	})
}

function load_sdps(rst) {
	adata.elig=rst.elig;
	$("#cra-status-hdr").text(rst.status)
	adata.aldt=rst.aldt//
	adata.eld=rst.eld;//entitled contract renewal days

	var flds=[{lb:"Submitted on",fn:"submitted_on"},{lb:"Position",fn:"psn"},{lb:"Department",fn:"fdept"},{lb:"Status",fn:"status"},{lb:"Place of Study",fn:"place_of_study"},{lb:"Program",fn:"program"},{lb:"Start Year",fn:"start_year"},{lb:"",fn:"btns"}]
	var sdps=rst.sdps;

	for(var i=0;i<sdps.length;i++){
		var pdept=sdps[i].pdept;
		var dept=sdps[i].dept
		var status=sdps[i].status
		if(pdept)
			pdept=", "+pdept
		else
			pdept=""
		sdps[i].fdept=dept+pdept
		sdps[i].btns="<button class='btn btn-primary btn-sm' onclick=\"view_sdp("+i+")\"><i class='fa fa-eye'></i> View</button>"
		
	}
	adata.sdps=sdps
	gen_table(flds,sdps,"sdp-div","No SDPS made")
}

function isWeekend(date1, dur) {
    var we=[];var k=0
    var d1 = new Date(date1),
        d2 = new Date(date2), 
        isWeekend = false;
    while (d1 < d2) {
        var day = d1.getDay();
        isWeekend = (day == 6) || (day == 0);
        if (isWeekend) {
            var vl=d1.getFullYear()+"-"+(d1.getMonth()+1)+"-"+d1.getDate()
            we[k++]=vl;
        }
        d1.setDate(d1.getDate() + 1);
    }
    return we;
}


