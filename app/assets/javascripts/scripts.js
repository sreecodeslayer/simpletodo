$(document).ready(function(){
	$('#input_task').keypress(function (e) {
		var key = e.which;
		if(key === 13) {
			var task = $('#input_task').val();
			if (task.length <=0) {
				// alert("Nothing to do ?? , Why you here ?? ;-)")
			} else {
				$.post( "/tasks/create", {user:{ name: task, user_id: user_id,status:0 }} ).done(function( data ) {
					$('#task_list').prepend(data);
					// update_first_and_last();
				});
				$('#input_task').val('');
				$('result_status').val('');
			}
		}
	});
	$('#comment_body').keypress(function (e) {
		var key = e.which;
		if(key === 13) {
			var comment = $('#comment_body').val();
			if (comment.length <=0) {
				// alert("Nothing to do ?? , Why you here ?? ;-)")
			} else {
				var id=parseInt($("#task_id").html());
				$.post( "/tasks/"+id+"/comments", {comment:{ body: comment, user_id: user_id }} ).done(function( data ) {
					$("#comment_list").append(data);
					// update_first_and_last();
				});
				$('#comment_body').val('');
			}
		}
	});
	$('#task_list').infinitescroll({

		navSelector: '#page-nav',	// selector for the paged navigation
		nextSelector : '#page-nav a',	
		// selector for the NEXT link (to page 2)
		itemSelector : ".task",
		donetext	: " we've hit the end" ,
		loading: {
			speed: 'slow',
			finishedMsg: 'No more tasks to load.',
			img: '/assets/ajax-loader.gif'
			}
	});
	$("#progress-slider").change(function(event) {
		alert($(this).val());
		var id=parseInt($("#task_id").html());
		var progress=$(this).val();
		$.ajax({
		url: '/tasks/change_progress',
		type: 'PUT',
		data: { task:{id: id,progress:progress} },
		success: function(result) {
				// $('#task'+id).replaceWith(result);
				alert("rer");
				$("#comment_list").append(result);
			}
		});
	});
    // $('#user_list').multiselect();

  //   $('#share_button').click(function(event) {
  //   	// alert($('#user_list').val());
  //   	var id=parseInt($("#task_id").html());
  //   	var user_list=$('#user_list').val();
  //   	$.ajax({
		// 	url: '/tasks/share_task/'+id,
		// 	type: 'POST',
		// 	data: { task:{id: id,user_list:user_list} },
		// 	success: function(result) {
		// 		//alert("success")
		// 		$('#task'+id).html(result);

		// 	}
		// });
  //   });
    $('input').iCheck({
	    checkboxClass: 'icheckbox_flat-green',
	    radioClass: 'iradio_flat-green'
	});
	var $slider = $("#slider");
		if ($slider.length > 0) {
		  $slider.slider({
		    min: 0,
		    max: 100,
		    value: 0,
		    orientation: "horizontal",
		    range: "min"
		  });
	}
	var WaitCount=0;
	$( "#slider" ).slider({
	  change: function( event, ui ) {
		var id=parseInt($("#task_id").html());
		var progress=$(this).slider("value");
		$("#slider_count").html(progress+"%");
		WaitCount++;
		setTimeout(function(){
			// alert(WaitCount);
			WaitCount--;
			if(WaitCount<=0) {
				$.ajax({
				url: '/tasks/change_progress',
				type: 'PUT',
					data: { task:{id: id,progress:progress} },
					success: function(result) {
						// $('#task'+id).replaceWith(result);
						$("#comment_list").append(result);
						IsWaiting=false;
					}
				});
			}
		}, 5000);
		
	  }
	});

});
function delete_task (id){
	$.ajax({
		url: '/tasks/'+id,
		type: 'DELETE',
		success: function(result) {
			//alert("success")
			$('#task'+id).remove();
			// update_first_and_last();
		}
	});
}
function confirm_delete_task (id){
	$.ajax({
		url: '/tasks/get_task_delete_confirm/'+id,
		type: 'GET',
		success: function(result) {
			//alert("success")
			$('#task'+id).html(result);
		}
	});
	$('#task'+id).css('border-color', '#c1392b');
	$('#task'+id).css('border-style', 'solid');
}
function confirm_delete_task_modal (id,condition){
	bootbox.confirm("Are you sure?", function(result) {
	  if(result==true) {
	  	if(condition) {
		  	$.ajax({
				url: '/tasks/'+id,
				type: 'DELETE',
				success: function(result) {
					//alert("success")
					$('#task'+id).remove();
					// update_first_and_last();
				}
			});
		  } else {
		  	$.ajax({
				url: '/tasks/delete_share/'+id,
				type: 'DELETE',
				success: function(result) {
					//alert("success")
					$('#task'+id).remove();
					// update_first_and_last();
				}
			});
		  }
	  	window.location.replace("/tasks");
	  	}

	}); 
	
}
function change_status(id) {
	$.ajax({
		url: '/tasks/change_status',
		type: 'PUT',
		data: { task:{id: id} },
		success: function(result) {
			// $('#task'+id).replaceWith(result);
			$('#task'+id).animate({
		        "opacity" : "0", //property
			    },1000, //duration of animation (optional)
			    function(){
			        $('#task'+id).remove();
			        // update_first_and_last();
			    } //function to run on complete (optional)
		 	);
		 	$("#comment_list").append(result);
			 if ($('#status_button').attr('class')=="uncheck_button") {
			 	$('#status_button').attr('class','check_button')
			 	$( "#slider" ).slider( "enable" );
			 } else {
			 	$('#status_button').attr('class','uncheck_button')
			 	$( "#slider" ).slider( "disable" );
			 }
			}
	});
}
function move_up(position) {
	$.ajax({
		url: '/tasks/move_up',
		type: 'PUT',
		data: { task:{position: position} },
		success: function(result) {
			// $("#task"+).insertBefore($(this).prev('.div1'));
			// alert( result.task );
			var task_id="task"+result.task;
			var other_task_id="task"+result.other_task;
			// swap_div(task_id,other_task_id);
			$('#'+task_id).insertBefore($('#'+task_id).prev());
			update_task($('#'+task_id));
			update_task($('#'+task_id).prev());
			update_task($('#'+task_id).next());
			// $('#'+task_id).insertBefore($('#'+other_task_id));
			// update_first_and_last();
		}
	});
}
function move_down(position) {
	$.ajax({
		url: '/tasks/move_down',
		type: 'PUT',
		data: { task:{position: position} },
		success: function(result) {
			// $('#task_list').html(result);
			// alert( result.task );
			var task_id="task"+result.task;
			var other_task_id="task"+result.other_task;
			$('#'+task_id).insertAfter($('#'+task_id).next());
			update_task($('#'+task_id));
			update_task($('#'+task_id).next());
			update_task($('#'+task_id).prev());
			// update_first_and_last();
			// swap_div(task_id,other_task_id);
		}
	});
}
function cancel_delete (id) {
	$.ajax({
		url: '/tasks/show/'+id,
		type: 'GET',
		success: function(result) {
			$('#task'+id).replaceWith(result);

		}
	});
}
function load_next(page) {
	$('#load_next').remove();
	$.ajax({
		url: '/tasks/task_list?page='+page,
		type: 'GET',
		success: function(result) {
			$('#task_list').append(result);
		}
	});
}
function update_first_and_last() {
	update_task($(".task:last"));
	update_task($(".task:last").prev());
	update_task($(".task:first"));
	update_task($(".task:first").next());
}
function update_task(task) {
	var id_string=task.attr('id');
	var id=parseInt(id_string.replace("task", ""));
	$.ajax({
		url: '/tasks/show/'+id,
		type: 'GET',
		success: function(result) {
			$("#"+id_string).replaceWith(result);
		}
	});
}
function swap_div(id1,id2) {
	// $('#'+id1).prev().insertBefore($('#'+id2))

}
