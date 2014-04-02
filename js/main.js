var nickname;

$(window).load(function() {
    $("#nickname_form").submit(setNickname);

    //get recent rooms:
    $.get('/recentRooms.json', function(data) {
        if (data.recentRooms.length > 0)
            displayRecentRooms(data.recentRooms);
        else 
            noRecentRooms();
    });

});

function setNickname(e) {
	e.preventDefault();
	nickname = $("#nickname_input").val();
	out(nickname);
	if (!nickname) {
		return; //prevent Kim trolls
	}

	//save nick for server?

	$("#prompt_wrap").remove();

}



function out(str) {
	console.log(str);
}