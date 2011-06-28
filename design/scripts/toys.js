/* Squareweave did many sexy things for this one. oh yeah. Thanks Yuri. Thanks Will. Thanks jQuery. */

$(function(){

	
	var images = [
		'mchammer',
		'freshprince',		
		'plane'
	]
	
	var i = 0;
	
	function touchthis(){
	
		$('.js_mover').animate({
		  width: '100%'
		}, 20000, function() {
			i++
			if (images.length == i){i=0;}
				
		  $('.js_fuckyeah').empty();

		  $('.js_fuckyeah').append('<img src="awesome/' + images[i] + '.gif">');

		  $('.js_linky').attr('href', 'awesome/' + images[i] + '.gif');
		  $('.js_linky').text('' + images[i] +'.gif');
		  
		  touchthis();
		  
		});
	}

	touchthis();

});
