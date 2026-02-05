var adata={url:"/admin"}

function send_reminder() {
	var data=prep_data([])
	data.rq="send-reminders"
	ajax_go(data,function () {
		display_succ("Reminders sent successfully")
	})
}