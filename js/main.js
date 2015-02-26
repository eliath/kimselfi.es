var _video,
	_canvas,
	_context,
	_stream,
	_kimCanvas,
	_kimCtx,
	results_shown = false;


$(function() {
	_video   = document.getElementById("monitor");
	_stream  = null;

	navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || 
								navigator.mozGetUserMedia || navigator.msGetUserMedia;
	
	// Check if supported:
	if (navigator.getUserMedia) {
		//Bind video source to input stream:
		navigator.getUserMedia({video: true}, 
		function(stream) {
			_stream = stream;
			_video.src = window.URL.createObjectURL(_stream);
		}, errCallback);
	
		//set up canvases:
		_canvas = document.getElementById('snap_canvas');
        _context = _canvas.getContext('2d');
        _kimCanvas = document.getElementById('kim_canvas');
        _kimCtx = _kimCanvas.getContext('2d');

        //add event listeners:
        $( window ).resize(sizeKim);
		_video.addEventListener('click', snap, false);
		_video.addEventListener('play', camReady, false);
		$("#kim").click(snap);
		// $("#snap_button").click(snap);
		$( window ).keypress(function(e){
			if(e.keyCode == 32 && !results_shown) {
				e.preventDefault();
				snap(); //snapshot on spacebar
			} else if(e.keyCode == 13 && results_shown) {
				e.preventDefault();
				playAgain(); //return to snapping area on 'ENTER'
			}
		});

		resemble.outputSettings({
			errorColor: {
				red: 255,
				green: 185,
				blue: 200
			},
			// errorType: 'movement',
			transparency: 0.8
		});

	} else {
		errorMsg();
	}
});


/**
 * Fired when the webcam is accepted &
 * is ready to be played
 */
function camReady() {
	console.log("cam ready!");
	sizeKim();
	$("#overlay").fadeOut(800);
}

function sizeKim() {
	var fullW = $("#monitor").width();
	var fullH = $("#monitor").height();
	var screen_ratio = fullW / fullH;
	var aspect_ratio = _video.videoWidth / _video.videoHeight;
	var scale;
	
	if (aspect_ratio > screen_ratio)
		scale = fullW / _video.videoWidth;
	else
		scale = fullH / _video.videoHeight;

	var h = Math.floor(_video.videoHeight * scale);
	$("#kim").css('background-size', h+'px auto');
}

function refreshKim() {
	var i = Math.floor(Math.random() * 27);
	var url = getKimImgURL(i);
	$("#kim").css('background-image', url);
	sizeKim();
}


function getKimImgURL(i) {
	return "url(/click/img/kims/"+i+".jpg)";
}



function snap() {
	if (_stream) {
		//first capture user selfie:
        _context.drawImage(_video, 0, 0, 300, 150);
		//_context.drawImage(_video, 0, 0);
		var img_out = document.getElementById('snap');
		var usr_dataURL = _canvas.toDataURL('image/webp');
		img_out.src = usr_dataURL;

		// Then capture Kim K (to normalize) with webcam
		var temp_img = new Image();
		temp_img.src = $('#kim').css('background-image').replace(/url\(|\)$/ig, "");
		var bgImgWidth = temp_img.width;
		var bgImgHeight = temp_img.height;
		console.log(bgImgWidth, bgImgHeight);
		_kimCtx.drawImage(img_out, 0, 0);
		_kimCtx.drawImage(temp_img, 37.5, 0, 225, 150);

		img_out = document.getElementById('kimk');
		var kim_dataURL = _kimCanvas.toDataURL('image/webp'); //TESTME: Chrome is best, others fall back to 'image/png'.
		img_out.src = kim_dataURL;

		resemble(usr_dataURL).compareTo(kim_dataURL).onComplete(function(data) {
			// console.log(data);
			var result_img = new Image();
			result_img.src = data.getImageDataUrl();
			$('#result').html(result_img);

			var match = 100 - data.misMatchPercentage;
			console.log("- Percent Match:", match);
			var score = Math.floor(match*100);
			$("#score").text(score);

			//animate lower to top
			$("#lower").animate({"top": 0}, 400, function() {
				results_shown = true;
			});

			//Sharing:
			var score_str = 'I got a ' + score + ' Kim Selfies Score!';
			//put info into fb share button thing
			$("meta[property='og:title']").attr('content', score_str);
			//put info in tweet thing //XXX doesnt work
			// $("#tweet").attr('data-text', score_str +  " How #kim are you?");

			//return data;
			/*
			{
				misMatchPercentage : 100, // %
				isSameDimensions: true, // or false
				getImageDataUrl: function(){}
			}
			*/
		}).ignoreColors();
	}
}

function errorMsg() {
	alert("Kim is not supported by your browser. Try Chrome or Firefox. ");
}

function errCallback(e) {
	err("---ERROR:---\n", e);
}

function out(str) {
	console.log(str);
}

function err(str) {
	console.error(str);
}

function showAbout() {
	var abt  = $("#aboutPane"),
		help = $("#helpPane");

	if (help.is(":visible"))
		help.fadeToggle('slow');
	abt.fadeToggle('slow');
}

function showHelp() {
	var abt  = $("#aboutPane"),
		help = $("#helpPane");

	if (abt.is(":visible"))
		abt.fadeToggle('slow');
	help.fadeToggle('slow');
}

function playAgain() {
	$("#playagain").blur();
	refreshKim();
	$("#lower").animate({"top": "100%"}, 300, function() {
		results_shown = false;
	});
}