adata.pg="plans"
$(function () {
	get_plans()
	populate_cs_day()
	$('.modal').modal();
	$('select').formSelect();

	
})
function get_plans() {
	adata.rq="get-plans"
	var data=prep_data([])
	ajax_go(data,function (rst) {
		load_select(rst.progs,"id","prog_name","#prog_id")
		load_plans(rst)
	})
}

function submit_plan() {
	var hd=[{lb:"Action",fn:"action",ft:"sel"},{lb:"Remarks",fn:"remarks"}]
	adata.rq="submit-plan"
	var data=prep_data(hd)
	if(!data) return 0

	data.plan_id=adata.plan_id
	var cfm=confirm('Confirm submission?')
	if(!cfm) {return 0}
	ajax_go(data,function (rst) {
		display_succ("Submitted")
		$(".modal").modal("close")
		load_plans(rst)
		
	})
}
function load_plans(rst) {
	var plans=rst.plans;
	adata.plans=plans;
	var flds=[{lb:"#",ft:"serial"},{lb:"Institution",fn:"org_name"},{lb:"Plan",fn:"plan"},{lb:"FY",fn:"fy"},{lb:"Programme",fn:"prog_name"},{lb:"Creation Date",fn:"recorded"},{lb:"Status",fn:"status"},{lb:"Preview",oc:"preview_plan",ft:"btn",text:"Preview"}]
	
	gen_table(flds,plans,"plans-div","No plans submitted")
	
}
function preview_plan(i){
	var plans=adata.plans
	adata.plan_id=plans[i].id;

	adata.fy=plans[i].fy
	adata.rq="preview-plan"
	var data=prep_data([])
	data.plan_id=adata.plan_id
	adata.status=plans[i].status;

	ajax_go(data,function (rst) {
		if(adata.status=="Approved"||adata.status=="Declined"){
			$("#approval-div").hide()
		}
		else{
			$("#approval-div").show()
		}
		load_preview(rst)
	})
}

function load_preview(rst) {
	var div=`<p>Programme Name: ${rst.plan.prog_name}</p>
			<p>Programme Goal:  ${rst.plan.programme_goal}</p>
	`

	var sp_objectives=rst.sp_objectives;
	var sp_outcomes=rst.sp_outcomes
	var sp_interventions=rst.sp_interventions;
	var sp_outputs=rst.sp_outputs
	for(var i=0;i<sp_objectives.length;i++){
		var sp_objective_id=sp_objectives[i].id;
		div+=`<p>Programme Objective: ${sp_objectives[i].objective}</p>
			<p>Institutional Objective: ${sp_objectives[i].org_objective}</p>`
		for(var j=0;j<sp_outcomes.length;j++){
			var sp_objective_id_j=sp_outcomes[j].sp_objective_id;
			var sp_outcome_id=sp_outcomes[j].id;
			if(sp_objective_id_j==sp_objective_id){
				div+=`<p>Vote Outcome: ${sp_outcomes[j].outcome}</p>`
				var tb=load_sp_outcome_indicators_preview(rst,sp_outcome_id)
				div+=tb;
				
				for(var m=0;m<sp_interventions.length;m++){
					var sp_outcome_id_m=sp_interventions[m].sp_outcome_id
					var sp_intervention_id=sp_interventions[m].id;
					if(sp_outcome_id==sp_outcome_id_m){
						div+=`<p>Strategic Intervention: ${sp_interventions[m].intervention}</p>`
						for(var k=0;k<sp_outputs.length;k++){
							var sp_output_id=sp_outputs[k].id;
							var sp_intervention_id_k=sp_outputs[k].sp_intervention_id
							if(sp_intervention_id_k==sp_intervention_id){
								div+=`<p>PIAP Output: ${sp_outputs[k].output}</p>`
								var tb=load_sp_output_indicators_preview(rst,sp_output_id)
								div+=tb;
								var tb=load_sp_output_actions_preview(rst,sp_output_id)
								div+=tb;
							}
						}
					}
				}
			}
		}
	}

	$("#preview-div").html(div)
	$("#preview-modal").modal("open")
}
function load_sp_outcome_indicators_preview(rst,sp_outcome_id) {
	var sp_outcome_indicators=rst.sp_outcome_indicators;
	var sp_outcome_indicator_targets=rst.sp_outcome_indicator_targets;

	adata.sp_outcome_indicators=sp_outcome_indicators
	adata.sp_outcome_indicator_targets=sp_outcome_indicator_targets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb=`<table><tr><td class='bld'>Indicator</td>`
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		if(i==0)
			fy="Baseline ("+fy+")"
		else
			fy="Target ("+fy+")"
		tb+=`<td class='bld'>${fy}</td>`
	}
	tb+=`</tr>`

	for(var i=0;i<sp_outcome_indicators.length;i++){
		var id=sp_outcome_indicators[i].id;
		var sp_outcome_id_i=sp_outcome_indicators[i].sp_outcome_id;
		if(sp_outcome_id_i!=sp_outcome_id)
			continue
		var fnd=1;
		var aoi=sp_outcome_indicators[i].adapted_outcome_indicator;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_outcome_indicators[i].indicator=aoi+"**"
		}
		tb+=`<tr><td>${sp_outcome_indicators[i].indicator}</td>`
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_outcome_indicator_targets.length;m++){
				var sp_outcome_indicator_id=sp_outcome_indicator_targets[m].sp_outcome_indicator_id
				var fy=sp_outcome_indicator_targets[m].fy
				if(sp_outcome_indicator_id==id&&fy==years[j]){
					var val=sp_outcome_indicator_targets[m].val;
					break;
				}
			}
			
			tb+=`<td>${val}</td>`
		}
		tb+=`</tr>`

	}
	tb+=`</table>`

	if(!fnd){
		tb=`<p class='bld'>No outcome indicators added</p>`
	}
	return tb;
}
function back() {
	$(".card").hide()
	$("#plans-card").show()
}
function view_plan() {
	$(".card").hide()
	$("#plan-creation-card").show()
}

function remove_plan(index) {
	var id=adata.plans[index].id;
	var data={url:adata.url,rq:"remove-plan",id:id}
	ajax_go(data,function (rst) {
		load_plans(rst)
	})
}


//OBJECTIVES
function get_sp_objectives(i) {
	if(i=="back")
		i=adata.plan_index
	else
		adata.plan_index=i;
	var plan=adata.plans[i]
	adata.rq="get-sp_objectives"
	adata.plan_id=plan.id
	adata.fy=plan.fy
	var data=prep_data([])
	data.plan_id=plan.id
	data.prog_id=plan.prog_id;
	ajax_go(data,function (rst) {
		load_sp_objectives(rst)
		var objectives=rst.objectives;
		load_select(objectives,"id","objective","#objective_id")
		$("#sp-objectives-hdr").text(plan.plan)
	})
}

function load_sp_objectives(rst) {
	$(".card").hide()
	$("#sp_objectives-card").show()
	var sp_objectives=rst.sp_objectives;
	adata.sp_objectives=sp_objectives;
	var flds=[{lb:"Objective",fn:"objective"},{lb:"Institution Objective",fn:"org_objective"},{lb:"",text:"Outcomes",ft:"btn",oc:"get_sp_outcomes"}]
	gen_table(flds,sp_objectives,"sp_objectives-div","No objectives added")
}

function add_objective() {
	adata.rq="add-objective"
	var data=prep_data([{lb:"Objective",ft:"sel",fn:"objective_id"},{lb:"Institution Objective",fn:"org_objective"}]);
	if(!data){return }
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		load_sp_objectives(rst)
		
	})
}

//OUTCOMES
function get_sp_outcomes(i) {
	if(i=="back")
		i=adata.objective_index
	else
		adata.objective_index=i;
	var objective=adata.sp_objectives[i]

	adata.rq="get-sp_outcomes"
	adata.sp_objective_id=objective.id;
	var data=prep_data([])
	data.sp_objective_id=objective.id;
	data.objective_id=objective.objective_id
	ajax_go(data,function (rst) {
		load_sp_outcomes(rst)
		var outcomes=rst.outcomes;
		load_select(outcomes,"id","outcome","#outcome_id")
		$("#sp_outcomes-hdr").text(objective.objective)
	})
}

function load_sp_outcomes(rst) {
	$(".card").hide()
	$("#sp_outcome-card").show()
	var sp_outcomes=rst.sp_outcomes;
	adata.sp_outcomes=sp_outcomes;
	
	var flds=[{lb:"Outcome",fn:"outcome"},{lb:"",ft:"btn",text:"Indicators",oc:"get_sp_outcome_indicators"},{lb:"",ft:"btn",text:"Interventions",oc:"get_sp_interventions"}]
	gen_table(flds,sp_outcomes,"sp_outcome-div","No outcomes added")
}

function add_outcome() {
	adata.rq="add-outcome"

	var data=prep_data([{lb:"Outcome",ft:"sel",fn:"outcome_id"}]);
	if(!data){return }

	data.sp_objective_id=adata.sp_objective_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		load_sp_outcomes(rst)
		
	})
}

//OUTCOME INDICATOR
function add_sp_outcome_indicator() {
	adata.rq="add-sp-outcome-indicator"
	var axn=$("#oci_axn").val()
	var aoi_op=1;

	
	if(axn=="Adapt"){
		var data=prep_data([{lb:"Indicator",ft:"sel",fn:"outcome_indicator_id"},{lb:"Adapted Text",fn:"adapted_outcome_indicator"}]);
	}
	else{
		var data=prep_data([{lb:"Indicator",ft:"sel",fn:"outcome_indicator_id"}]);
	}
	if(!data){return }
	data.sp_outcome_id=adata.sp_outcome_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		$("#adapted_outcome_indicator").val("")

		load_sp_outcome_indicators(rst)
		
	})
}
function get_sp_outcome_indicators(i) {
	var sp_outcome=adata.sp_outcomes[i]
	adata.rq="get-sp-outcome-indicators"
	adata.sp_outcome_id=sp_outcome.id;
	var data=prep_data([])
	data.sp_outcome_id=sp_outcome.id;
	data.outcome_id=sp_outcome.outcome_id

	ajax_go(data,function (rst) {
		load_sp_outcome_indicators(rst)
		var outcome_indicators=rst.outcome_indicators;
		
		load_select(outcome_indicators,"id","indicator","#outcome_indicator_id")
		$("#outcome-indicator-modal")
		$("#outcome-indicator-modal").modal("open")
		//$("#sp_interventions-hdr").text(sp_outcome.outcome)
		
		
	})
}
function save_sp_outcome_indicator_target() {
	adata.rq="save-sp-outcome-indicator-target"
	var sp_outcome_indicators=adata.sp_outcome_indicators;

	var sp_outcome_indicator_targets=adata.sp_outcome_indicator_targets;
	var targets=[]
	var years=adata.years
	var k=0;
	for(var i=0;i<sp_outcome_indicators.length;i++){
		
		var id=sp_outcome_indicators[i].id;

		for(var j=0;j<years.length;j++){
			var val=$("#outcome-indicator-target-"+j+"-"+sp_outcome_indicators[i].id).val()
			var nu=false;//no update
			var id2=null
			for(var m=0;m<sp_outcome_indicator_targets.length;m++){

				val2=sp_outcome_indicator_targets[m].val;
				sp_outcome_indicator_id=sp_outcome_indicator_targets[m].sp_outcome_indicator_id
				var fy=sp_outcome_indicator_targets[m].fy;
				if(sp_outcome_indicator_id==id&&fy==years[j]){
					var id2=sp_outcome_indicator_targets[m].id;
					
					if((val==val2)||(val==""&&val2==null)){
						var nu=true;//no update
						break;
					}
					break;
				}

			}
			

			targets[k++]={sp_outcome_indicator_id:sp_outcome_indicators[i].id,id:id2,value:val,fy:years[j]}
		}
		
	}
	var data=prep_data([]);
	data.targets=targets
	data.fy=adata.fy
	if(!data){return }
	data.sp_outcome_id=adata.sp_outcome_id;
	
	ajax_go(data,function (rst) {
		
		load_sp_outcome_indicators(rst)
		
	})
}
function generateFin_Years(startYear) {

    const years = [];
    // Extract the first part (e.g. 2024 from "2024/25")
    let start = parseInt(startYear.split("/")[0]);

    for (let i = 0; i < 6; i++) {   // 5 years: baseline + 4 targets
        let next = (start + 1).toString().slice(-2); 
        years.push(`${start}/${next}`);
        start++;
    }

    return years;
}
function adopt_adapt_changed(axn,id) {


	if(axn=="Adapt"){
		$("#"+id).show()
	}
	else{
		$("#"+id).hide()
	}
}
function load_sp_outcome_indicators(rst) {
	var sp_outcome_indicators=rst.sp_outcome_indicators;
	var sp_outcome_indicator_targets=rst.sp_outcome_indicator_targets;

	adata.sp_outcome_indicators=sp_outcome_indicators
	adata.sp_outcome_indicator_targets=sp_outcome_indicator_targets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb="<br><button class='btn' onclick=\"save_sp_outcome_indicator_target()\">Save Changes</button><table><tr><td>Indicator</td>"
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		if(i==0)
			fy="Baseline ("+fy+")"
		else
			fy="Target ("+fy+")"
		tb+="<td>"+fy+"</td>"
	}
	tb+="</tr>"

	for(var i=0;i<sp_outcome_indicators.length;i++){
		var id=sp_outcome_indicators[i].id;
		var aoi=sp_outcome_indicators[i].adapted_outcome_indicator;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_outcome_indicators[i].indicator=aoi+"**"
		}
		tb+="<tr><td>"+sp_outcome_indicators[i].indicator+"</td>"
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_outcome_indicator_targets.length;m++){
				var sp_outcome_indicator_id=sp_outcome_indicator_targets[m].sp_outcome_indicator_id
				var fy=sp_outcome_indicator_targets[m].fy
				if(sp_outcome_indicator_id==id&&fy==years[j]){
					var val=sp_outcome_indicator_targets[m].val;
					break;
				}
			}
			
			tb+="<td><input value=\""+val+"\" id=outcome-indicator-target-"+j+"-"+id+"></td>"
		}
		tb+="</tr>"

	}
	tb+="</table>"

	if(sp_outcome_indicators.length==0){
		tb="<p>No outcome indicators added</p>"
	}
	$("#sp-outcome-indicators-div").html(tb)
}


//INTERVENTIONS
function get_sp_interventions(i) {
	if(i=="back")
		i=adata.outcome_index
	else
		adata.outcome_index=i;
	var sp_outcome=adata.sp_outcomes[i]
	adata.rq="get-sp_interventions"
	adata.sp_outcome_id=sp_outcome.id;
	var data=prep_data([])
	data.sp_outcome_id=sp_outcome.id;
	data.outcome_id=sp_outcome.outcome_id
	ajax_go(data,function (rst) {
		load_sp_interventions(rst)
		var interventions=rst.interventions;
		load_select(interventions,"id","intervention","#intervention_id")
		$("#sp_interventions-hdr").text(sp_outcome.outcome)
	})
}

function load_sp_interventions(rst) {
	$(".card").hide()
	$("#sp_interventions-card").show()
	var sp_interventions=rst.sp_interventions;
	
	adata.sp_interventions=sp_interventions

	var flds=[{lb:"Intervention",fn:"intervention"},{lb:"",ft:"btn",text:"Outputs",oc:"get_sp_outputs"}]
	gen_table(flds,sp_interventions,"sp_interventions-div","No interventions added")
}

function add_intervention() {
	adata.rq="add-intervention"
	var data=prep_data([{lb:"Intervention",ft:"sel",fn:"intervention_id"}]);
	if(!data){return }
	data.sp_outcome_id=adata.sp_outcome_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		load_sp_interventions(rst)
		
	})
}



//OUTPUTS

function get_sp_outputs(i) {
	if(i=="back")
		i=adata.intervention_index
	else
		adata.intervention_index=i;
	var sp_intervention=adata.sp_interventions[i]
	adata.rq="get-sp_outputs"
	adata.sp_intervention_id=sp_intervention.id;
	var data=prep_data([])
	data.sp_intervention_id=sp_intervention.id;
	data.intervention_id=sp_intervention.intervention_id
	ajax_go(data,function (rst) {
		load_sp_outputs(rst)
		var outputs=rst.outputs;
		load_select(outputs,"id","output","#output_id")
		$("#sp_outputs-hdr").text(sp_intervention.intervention)
	})
}

function load_sp_outputs(rst) {
	$(".card").hide()
	$("#sp_outputs-card").show()
	var sp_outputs=rst.sp_outputs;
	adata.sp_outputs=sp_outputs
	var flds=[{lb:"Output",fn:"output"},{lb:"",ft:"btn",text:"Indicators",oc:"get_sp_output_indicators"},{lb:"",ft:"btn",text:"PIAP Actions",oc:"get_piap_actions"}]
	gen_table(flds,sp_outputs,"sp_outputs-div","No outputs added")
}

function add_output() {
	adata.rq="add-output"
	var data=prep_data([{lb:"Output",ft:"sel",fn:"output_id"}]);
	if(!data){return }
	data.sp_intervention_id=adata.sp_intervention_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		load_sp_outputs(rst)
		
	})
}

//OUTPUT ACTIONS
function add_sp_output_action() {
	adata.rq="add-sp-output-action"
	var axn=$("#output_action").val()
	var aoi_op=1;
	if(axn=="Adapt"){
		var data=prep_data([{lb:"Action",ft:"sel",fn:"output_action_id"},{lb:"Adapted Text",fn:"adapted_output_action"},]);
	}
	else{
		var data=prep_data([{lb:"Action",ft:"sel",fn:"output_action_id"}]);
	}
	if(!data){return }
	data.sp_output_id=adata.sp_output_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		$("#adapted_output_action").val("")
		load_sp_output_actions(rst)
		
	})
}
function get_sp_activities() {
	$("#output-actions-modal").modal("close")
	$("#output-activities-modal").modal("open")
}
function get_piap_actions(i) {
	var sp_output=adata.sp_outputs[i]
	adata.rq="get-sp-output-actions"
	adata.sp_output_id=sp_output.id;
	var data=prep_data([])
	data.sp_output_id=sp_output.id;
	data.output_id=sp_output.output_id
	ajax_go(data,function (rst) {
		load_sp_output_actions(rst)
		var output_actions=rst.output_actions;
		
		load_select(output_actions,"id","action","#output_action_id")
		
		$("#output-actions-modal").modal("open")
		//$("#sp_interventions-hdr").text(sp_outcome.outcome)
	})
}

function load_sp_output_actions(rst) {
	var sp_output_actions=rst.sp_output_actions;
	adata.sp_output_actions=sp_output_actions
	var sp_output_action_budgets=rst.sp_output_action_budgets
	adata.sp_output_action_budgets=sp_output_action_budgets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb="<br><button class='btn' onclick=\"save_sp_output_action_budget()\">Save Changes</button><table><tr><td>Action</td>"
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		
		fy="Budget ("+fy+")"
		tb+="<td>"+fy+"</td>"
	}
	tb+="<td>Budget Source</td><td>Responsible Office</td></tr>"


	for(var i=0;i<sp_output_actions.length;i++){
		var aoi=sp_output_actions[i].adapted_output_action;
		var id=sp_output_actions[i].id;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_output_actions[i].action=aoi+"**"
		}

		tb+="<tr><td>"+sp_output_actions[i].action+"</td>"
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_output_action_budgets.length;m++){
				var sp_output_action_id=sp_output_action_budgets[m].sp_output_action_id
				var fy=sp_output_action_budgets[m].fy
				if(sp_output_action_id==id&&fy==years[j]){
					var val=sp_output_action_budgets[m].val;
					break;
				}
			}
			
			tb+="<td><input type='number' value=\""+val+"\" id=output-action-budget-"+j+"-"+id+"></td>"
		}
		tb+="<td>"+load_budget_source()+"</td><td>"+load_office()+"</td></tr>"
	}
	tb+="</table>"
	if(sp_output_actions.length==0){
		tb="<p>No output actions added</p>"
	}
	$("#sp-output-actions-div").html(tb)
}
function load_sp_output_actions_preview(rst,sp_output_id) {
	var sp_output_actions=rst.sp_output_actions;
	adata.sp_output_actions=sp_output_actions
	var sp_output_action_budgets=rst.sp_output_action_budgets
	adata.sp_output_action_budgets=sp_output_action_budgets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb=`<table><tr><td class='bld'>Action</td>`
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		
		fy="Budget ("+fy+")"
		tb+=`<td>${fy}</td>`
	}
	tb+=`<td class='bld'>Budget Source</td><td class='bld'>Responsible Office</td></tr>`

	var fnd=0
	for(var i=0;i<sp_output_actions.length;i++){
		var aoi=sp_output_actions[i].adapted_output_action;
		var id=sp_output_actions[i].id;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_output_actions[i].action=aoi+"**"
		}
		if(sp_output_id==sp_output_actions[i].sp_output_id)
			continue;
		var fnd=1
		tb+=`<tr><td>${sp_output_actions[i].action}</td>`
		var source=""
		var office=""
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_output_action_budgets.length;m++){
				var sp_output_action_id=sp_output_action_budgets[m].sp_output_action_id
				var fy=sp_output_action_budgets[m].fy
				if(sp_output_action_id==id&&fy==years[j]){
					var val=sp_output_action_budgets[m].val;
					var source=sp_output_action_budgets[m].source
					var office=sp_output_action_budgets[m].office
					var source=""
					var office=""
					break;
				}
			}
			
			tb+=`<td>${val}</td>`
		}
		tb+=`<td>${source}</td><td>${office}</td></tr>`
	}
	tb+=`</table>`
	if(fnd==0){
		tb="<p>No output actions added</p>"
	}
	return tb
	
}
function load_budget_source() {
	var sel="<select>"
	var sources=["GoU","SC"]
	for(var i=0;i<sources.length;i++){
		sel+="<option>"+sources[i]+"</option>"
	}
	sel+="</select>"
	return sel;
}
function load_office() {
	var sel="<select>"
	var sources=["Office of the Bursar","Office of School Registrar","Strategy& Projects","eLearning Centre"]
	for(var i=0;i<sources.length;i++){
		sel+="<option>"+sources[i]+"</option>"
	}
	sel+="</select>"
	return sel;
}
function save_sp_output_action_budget() {
	adata.rq="save-sp-output-action-budget"
	var sp_output_actions=adata.sp_output_actions;

	var sp_output_action_budgets=adata.sp_output_action_budgets;
	var budgets=[]
	var years=adata.years
	var k=0;
	for(var i=0;i<sp_output_actions.length;i++){
		
		var id=sp_output_actions[i].id;

		for(var j=0;j<years.length;j++){
			var val=$("#output-action-budget-"+j+"-"+sp_output_actions[i].id).val()

			var nu=false;//no update
			var id2=null
			for(var m=0;m<sp_output_action_budgets.length;m++){

				val2=sp_output_action_budgets[m].val;
				sp_output_action_id=sp_output_action_budgets[m].sp_output_action_id
				var fy=sp_output_action_budgets[m].fy;
				if(sp_output_action_id==id&&fy==years[j]){
					var id2=sp_output_action_budgets[m].id;
					
					if((val==val2)||(val==""&&val2==null)){
						var nu=true;//no update
						break;
					}
					break;
				}

			}
			

			budgets[k++]={sp_output_action_id:sp_output_actions[i].id,id:id2,value:val,fy:years[j]}
		}
		
	}
	var data=prep_data([]);
	data.budgets=budgets
	data.fy=adata.fy
	if(!data){return }
	data.sp_output_id=adata.sp_output_id;
	
	ajax_go(data,function (rst) {
		
		load_sp_output_actions(rst)
		
	})
}



//OUTPUT INDICATOR

function add_sp_output_indicator() {
	adata.rq="add-sp-output-indicator"
	var axn=$("#opi_axn").val()
	var aoi_op=1;
	if(axn=="Adapt"){
		var data=prep_data([{lb:"Indicator",ft:"sel",fn:"output_indicator_id"},{lb:"Adapted Text",fn:"adapted_output_indicator"}]);
	}
	else{
		var data=prep_data([{lb:"Indicator",ft:"sel",fn:"output_indicator_id"}]);
	}
	if(!data){return }
	data.sp_output_id=adata.sp_output_id;
	data.plan_id=adata.plan_id;
	ajax_go(data,function (rst) {
		$("#adapted_output_indicator").val("")
		load_sp_output_indicators(rst)
		
	})
}
function get_sp_output_indicators(i) {
	var sp_output=adata.sp_outputs[i]
	adata.rq="get-sp-output-indicators"
	adata.sp_output_id=sp_output.id;
	var data=prep_data([])
	data.sp_output_id=sp_output.id;

	data.output_id=sp_output.output_id
	ajax_go(data,function (rst) {
		load_sp_output_indicators(rst)
		var output_indicators=rst.output_indicators;
		
		load_select(output_indicators,"id","indicator","#output_indicator_id")
		
		$("#output-indicator-modal").modal("open")
		//$("#sp_interventions-hdr").text(sp_outcome.outcome)
	})
}

function load_sp_output_indicators(rst) {
	var sp_output_indicators=rst.sp_output_indicators;
	var sp_output_indicator_targets=rst.sp_output_indicator_targets;

	adata.sp_output_indicators=sp_output_indicators
	adata.sp_output_indicator_targets=sp_output_indicator_targets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb="<br><button class='btn' onclick=\"save_sp_output_indicator_target()\">Save Changes</button><table><tr><td>Indicator</td>"
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		if(i==0)
			fy="Baseline ("+fy+")"
		else
			fy="Target ("+fy+")"
		tb+="<td>"+fy+"</td>"
	}
	tb+="</tr>"

	for(var i=0;i<sp_output_indicators.length;i++){
		var id=sp_output_indicators[i].id;
		var aoi=sp_output_indicators[i].adapted_output_indicator;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_output_indicators[i].indicator=aoi+"**"
		}
		tb+="<tr><td>"+sp_output_indicators[i].indicator+"</td>"
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_output_indicator_targets.length;m++){
				var sp_output_indicator_id=sp_output_indicator_targets[m].sp_output_indicator_id
				var fy=sp_output_indicator_targets[m].fy
				if(sp_output_indicator_id==id&&fy==years[j]){
					var val=sp_output_indicator_targets[m].val;
					break;
				}
			}
			
			tb+="<td><input value=\""+val+"\" id=output-indicator-target-"+j+"-"+id+"></td>"
		}
		tb+="</tr>"

	}
	tb+="</table>"

	if(sp_output_indicators.length==0){
		tb="<p>No output indicators added</p>"
	}
	$("#sp-output-indicators-div").html(tb)
}

function load_sp_output_indicators_preview(rst,sp_output_id) {
	var sp_output_indicators=rst.sp_output_indicators;
	var sp_output_indicator_targets=rst.sp_output_indicator_targets;

	adata.sp_output_indicators=sp_output_indicators
	adata.sp_output_indicator_targets=sp_output_indicator_targets
	var  years=generateFin_Years(adata.fy)
	adata.years=years
	var tb=`<table><tr><td class='bld'>Indicator</td>`
	for(var i=0;i<years.length;i++){
		var fy=years[i];
		if(i==0)
			fy="Baseline ("+fy+")"
		else
			fy="Target ("+fy+")"
		tb+=`<td>${fy}</td>`
	}
	tb+=`</tr>`
	var fnd=0;
	for(var i=0;i<sp_output_indicators.length;i++){
		var id=sp_output_indicators[i].id;
		if(sp_output_id!=sp_output_indicators[i].sp_output_id)
			continue;
		var fnd=1
		var aoi=sp_output_indicators[i].adapted_output_indicator;
		if(aoi==0)
			aoi=null
		if(aoi){
			sp_output_indicators[i].indicator=aoi+"**"
		}
		tb+=`<tr><td>${sp_output_indicators[i].indicator}</td>`
		for(var j=0;j<years.length;j++){
			var val=""

			for(var m=0;m<sp_output_indicator_targets.length;m++){
				var sp_output_indicator_id=sp_output_indicator_targets[m].sp_output_indicator_id
				var fy=sp_output_indicator_targets[m].fy
				if(sp_output_indicator_id==id&&fy==years[j]){
					var val=sp_output_indicator_targets[m].val;
					break;
				}
			}
			
			tb+=`<td>${val}</td>`
		}
		tb+=`</tr>`

	}
	tb+=`</table>`

	if(fnd==0){
		tb=`<p>No output indicators added</p>`
	}
	return tb;
}
function save_sp_output_indicator_target() {
	adata.rq="save-sp-output-indicator-target"
	var sp_output_indicators=adata.sp_output_indicators;

	var sp_output_indicator_targets=adata.sp_output_indicator_targets;
	var targets=[]
	var years=adata.years
	var k=0;
	for(var i=0;i<sp_output_indicators.length;i++){
		
		var id=sp_output_indicators[i].id;

		for(var j=0;j<years.length;j++){
			var val=$("#output-indicator-target-"+j+"-"+sp_output_indicators[i].id).val()
			var nu=false;//no update
			var id2=null
			for(var m=0;m<sp_output_indicator_targets.length;m++){

				val2=sp_output_indicator_targets[m].val;
				sp_output_indicator_id=sp_output_indicator_targets[m].sp_output_indicator_id
				var fy=sp_output_indicator_targets[m].fy;
				if(sp_output_indicator_id==id&&fy==years[j]){
					var id2=sp_output_indicator_targets[m].id;
					
					if((val==val2)||(val==""&&val2==null)){
						var nu=true;//no update
						break;
					}
					break;
				}

			}
			

			targets[k++]={sp_output_indicator_id:sp_output_indicators[i].id,id:id2,value:val,fy:years[j]}
		}
		
	}
	var data=prep_data([]);
	data.targets=targets
	data.fy=adata.fy
	if(!data){return }
	data.sp_output_id=adata.sp_output_id;
	
	ajax_go(data,function (rst) {
		
		load_sp_output_indicators(rst)
		
	})
}


function get_preview() {
	
}