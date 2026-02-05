
function view_benefits_app(index) {

	$(".benefits-div").hide()
	$("#view-div").show()
	$("#benefits-app-modal").modal("show")
	$(".axn-btn").hide()
	var benefits_app=adata.benefits_apps[index]
	adata.benefits_app=benefits_app;
	var status=benefits_app.status;
	adata.appid=benefits_app.id;

	if(status=="Not Submitted"){
		$("#edit-btn,#delete-btn").show()
		
	}
	if(status=="Pending Approval by RBS Office"&&adata.me.priv=="rbsadmin")
	{
		$("#approve-btn,#decline-btn-dl").show()
	}

	$("#approval-view-div").hide()
	
	if(status=="Declined"||status=="Approved"){
		$("#approval-view-div").show()
	}

	var flds=[
    {
        "fn": "name",
        "lb": "Name"
    },
    {
        "fn": "sex",
        "lb": "sex"
    },
    {
        "fn": "dept",
        "lb": "dept"
    },
    {
        "fn": "psn",
        "lb": "psn"
    },
    {
        "fn": "phone",
        "lb": "Phone"
    },
    {
        "fn": "private_email",
        "lb": "Personal Email"
    },
    {
        "fn": "private_address",
        "lb": "Private Address"
    },
    {
        "fn": "exit_date",
        "lb": "Exit Date"
    },
    {
        "fn": "coy_no",
        "lb": "COY No."
    },
    {
        "fn": "member_portion_option",
        "lb": "Member Portion Option"
    },
    {
        "fn": "employer_portion_option",
        "lb": "Employer Portion Option"
    },
    {
        "fn": "bank",
        "lb": "Bank"
    },
    {
        "fn": "branch",
        "lb": "Branch"
    },
    {
        "fn": "account_name",
        "lb": "Account Name"
    },
    {
        "fn": "account_no",
        "lb": "Account Number"
    },
    {
        "fn": "status",
        "lb": "Status"
    },
    {
        "fn": "approver",
        "lb": "Approver"
    },
    {
        "fn": "axn_date",
        "lb": "Action Date"
    },
    {
        "fn": "remark",
        "lb": "Remark"
    },
    {
        "fn": "mo_transferee_scheme",
        "lb": "Member Option Transferee Scheme"
    },
    {
        "fn": "eo_transferee_scheme",
        "lb": "Employer Option Transferee Scheme"
    },
    {
        "fn": "app_date",
        "lb": "Application Date"
    }
]

	
	for(var i=0;i<flds.length;i++){
		var fn=flds[i].fn;
		var id="l"+flds[i].fn;
		var val=benefits_app[fn];
		adata[fn]=val
		if(val==undefined)
			val="#N/A"
		
		$("#"+id).html("<span>"+val+"<span>")
	}
}

