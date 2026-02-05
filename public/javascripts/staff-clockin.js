adata.pg="clockin"
$(function () {
	get_default()
	populate_cs_day()
	launch_location()
	
})
function get_default(status) {
	data=prep_data([])
	data.rq="get-default"
	ajax_go(data,function (rst) {
		adata.me=rst.user
		load_clockins(rst)

	})
}

function clockin_dl() {

	
		launch_cam(function () {
			$("#clockin-modal").modal("show")
			adata.rq="clockin"
			
			$("#clockout-btn,#clockin-btn").hide()
			get_rdept()
		})
	
	
}

function clockout_dl(i) {

		launch_cam(function () {
			var clockins=adata.clockins;
			var id=clockins[i].id;
			adata.id=id;
			$("#clockin-modal").modal("show")
			adata.rq="clockout"
		})
}
function load_clockins(rst) {
	var clockins=rst.clockins;
	adata.clockins=clockins
	for(var i=0;i<clockins.length;i++){
		var status=clockins[i].status;
		var img="image/snapshot-clockin-"+clockins[i].id+".jpg"
		var img_deleted=clockins[i].img_deleted;

		var time=clockins[i].clockin_time;
		var location=clockins[i].clockin_location
		if(!location)
			location="-"
		var ip=clockins[i].clockin_ip;
		var imgtd=""
		if(!img_deleted)
			var imgtd="<td rowspan=3><img style='width:100px;border-radius:5px' src='"+img+"'></td>"

		clockins[i].clockin_details="<table><tr>"+imgtd+"<td><i class='fa fa-clock-o'></i> "+time+"<td></tr><tr><td><i class='fa fa-map-marker'></i> "+location+"</td></tr><tr><td><i class='fa fa-globe'></i> "+ip+"</td></tr></table>"


		var img="image/snapshot-clockout-"+clockins[i].id+".jpg"
		var to=clockins[i].clockout_time
		if(!to)
			clockins[i].clockout_details="<button class='btn btn-primary' onclick=\"clockout_dl("+i+")\"> <i class='fa fa-sign-out'></i>Clock Out</button>";
		else{
			var time=clockins[i].clockout_time;
			var location=clockins[i].clockout_location
			if(!location)
				location="-"
			var ip=clockins[i].clockout_ip;
			var imgtd=""

			if(!img_deleted)
				var imgtd="<td rowspan=3><img style='width:100px;border-radius:5px' src='"+img+"'></td>"
			clockins[i].clockout_details="<table><tr>"+imgtd+"<td><i class='fa fa-clock-o'></i> "+time+"<td></tr><tr><td><i class='fa fa-map-marker'></i> "+location+"</td></tr><tr><td><i class='fa fa-globe'></i> "+ip+"</td></tr></table>"
		}
		var duration_hours=clockins[i].duration_hours;
		var duration_mins=clockins[i].duration_mins
		if(duration_hours)
			clockins[i].duration_hours=duration_hours+" Hr"
		if(duration_hours==0)
			clockins[i].duration_hours=duration_mins+" min"


	}
	var total=0;
	var hd=[{lb:"Clock-In",fn:"clockin_details"},{lb:"Clock-Out",fn:"clockout_details"},{lb:"Duration",fn:"duration_hours"}]
	gen_table(hd,clockins,"clockins-div","No clock-ins made")

}

function goto_link(pg) {
	window.location="/staff?pg="+pg
}
function back_to_cam() {
	launch_cam(function () {
		
	})
}
function launch_location(){
	
	if (!('geolocation' in navigator)) {

    display_err("Geolocation is not supported by your browser");
    return 0;
  }
	navigator.geolocation.getCurrentPosition((position) => {

		if(position.coords.accuracy>150){
			err_info("Location accuracy is too low")
		}
	 	adata.lat=position.coords.latitude
    adata.lng=position.coords.longitude
  
	},(error) => {
      // Handle errors here
      switch(error.code) {
        case error.PERMISSION_DENIED:
          err_info("Location permission denied");
          break;
        case error.POSITION_UNAVAILABLE:
          err_info("Location information is unavailable. Please ensure you are connected to internet");
          break;
        case error.TIMEOUT:
          err_info("The request to get your location timed out");
          break;
        default:
          err_info("An unknown error occurred");
          break;
      }

    },{
	  enableHighAccuracy: true,
	  timeout: 10000,
	  maximumAge: 0
	})
}
function err_info(msg){
	var tip="<span data-bs-toggle='tooltip' title='"+msg+". Note that verification using location may fail. If not on campus network, refresh page to try obtain new location information or remove VPN. However, if on campus network, just proceed as verification will succeed. "+"' style='cursor: pointer;'><i class='fa fa-info-circle'></i></span>"


	$("#err_info").html(msg+"<span></span>"+tip)
	const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}
let streamRef = null; // Global to keep reference to stream
function launch_cam(cb) {
	$("#video-div,#capture-btn").show()
	$("#snapshot-div,#camera-btn,#clockin-btn,#clockout-btn").hide()
	
  const video = document.getElementById('video');
  try{
  		navigator.mediaDevices.getUserMedia({ video: true })
	    .then(stream => {
	      video.srcObject = stream;
	       streamRef = stream; // Save stream for stopping later
	      // Wait until metadata (dimensions) is loaded
	      video.onloadedmetadata = () => {
	        video.play();
	      };
	      cb()
	    })
	    .catch(err => {display_err("Unable to launch camera, ensure your device has a camera and has permission access.");console.log(err)});

  }
  catch(e){
  	console.log(e)
	  display_err("Unable to launch camera, ensure your device has a camera and has permission access.")
  }

}
function stop_camera() {
	
  if (streamRef) {
    streamRef.getTracks().forEach(track => track.stop());
    streamRef = null;
  }
  const video = document.getElementById('video');
  video.srcObject = null;
}

function capture() {
  const video = document.getElementById('video');
  $("#video-div,#capture-btn").hide();
  $("#snapshot-div,#back-btn,#camera-btn").show();

  if (adata.rq === "clockin")
    $("#clockin-btn").show();
  else
    $("#clockout-btn").show();

  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 480;

  let width = video.videoWidth;
  let height = video.videoHeight;

  if (width > height) {
    if (width > MAX_WIDTH) {
      height = Math.round(height * MAX_WIDTH / width);
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = Math.round(width * MAX_HEIGHT / height);
      height = MAX_HEIGHT;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);

  const dataURL = canvas.toDataURL('image/jpeg', 0.7);
  adata.imageData = dataURL;

  const img = document.getElementById('snapshot');
  if (img) img.src = dataURL;
}



function clockout() {
	var cfm=confirm("Confirm Clock-out")
	if(!cfm)
		return 0;
	
	var flds=[]
	var data=prep_data(flds,"post")
	data.append("img",adata.imageData)
	if(adata.lat){
		data.append("lat",adata.lat)
		data.append("lng",adata.lng)
	}
	if(!data)
		return 0;
	ajax_file(data,function (rst) {
		$(".modal").modal("hide")
		load_clockins(rst)
		stop_camera()
	})
}
function clockin() {
	var flds=[]
	var data=prep_data(flds,"post")
	data.append("clockin_type","On-Campus")
	data.append("status","Pending")
	data.append("img",adata.imageData)
	data.append("rdept_id",adata.rdept_id)
	if(adata.lat){
		data.append("lat",adata.lat)
		data.append("lng",adata.lng)
	}
	if(!data)
		return 0;
	ajax_file(data,function (rst) {
		$(".modal").modal("hide")
		load_clockins(rst)
		stop_camera()
	})
}


function get_rdept() {
  //no status
  var dp=0
  var subject=$("#form_id").val()
  
  var hodtitle=adata.me.hodtitle
  var hodaccess=adata.me.hodaccess
  var rdept_id=adata.me.contract_dept
  var roles=adata.me.roles;
  var rtitle=hodtitle
  var hdept_id=0
  var role_name=0

  for(var i=0;i<roles.length;i++){
    var role=roles[i].priv;
    if(role=="dean"){
      rdept_id=0
      var rtitle="Principal";//reporting department head's title
      hdept_id=roles[i].dept_id;
      role_name=roles[i].name
      adata.dp=roles[i].dp
      break;
    }
    if(role=="hdm"){
      role="hdm";
      hdept_id=roles[i].dept_id;//department being headed

      var phtitle=roles[i].phtitle//faculty
      var rdept_id=roles[i].pdid; 
      var paccess=roles[i].paccess
      role_name=roles[i].name
      adata.dp=roles[i].dp
      break;
    }
  }
  
  if(role=="hdm"&&adata.me.contract_dept==hdept_id&&(adata.me.cat=="Administrative"||adata.me.cat=="Support")){
    rtitle="Principal"
    var rdept_id=0
  }
  else if(role=="hdm"&&adata.me.contract_dept==hdept_id&&adata.me.cat=="Academic"){
    
    rtitle=phtitle
    
  }
  else if(role=="hdm"&&paccess=="dean"){
    //HOD of an academic dept, but contract elsewhere
    rtitle=phtitle
  }
  else if(role=="hdm"&&subject==3){
    var rdept_id=0
  }

  else if(role=="hdm"){
    var rdept_id=adata.me.contract_dept
  }
  adata.lstatus=status
  adata.rdept_id=rdept_id;
  adata.hdept_id=hdept_id
  adata.role_name=role_name
  adata.rtitle=rtitle
  if(adata.me.deputy_dean){
    adata.rdept_id=adata.me.deputy_dean//ID of faculty where one is deputy dean
    
  }

}