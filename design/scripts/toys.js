/* Squareweave did many sexy things for this one. oh yeah. Thanks Yuri. Thanks Will. Thanks jQuery. */

$(function(){


	var images = [
		'freshprince.gif',		
		'yesss.gif',
		'80sdancedudes.gif',
		'cheerleadin.gif',
		'hairgirl.gif',
		'punchapuncha.gif',
		'turtledanceyo.gif',
		'afrogroove.gif',
		'chubbysuperheros.gif',
		'headsmash.gif',
		'pushpop.gif',
		'turtledenim.gif',
		'animevom.gif',
		'dancefish.gif',
		'headspin.gif',
		'pushpopohyeah.gif',
		'warioass.gif',
		'aprilisawesome.gif',
		'ddrfeld.gif',
		'hnnnngh.gif',
		'rockitlikecarlton.gif',
		'wolfman.gif',
		'balls.gif',
		'ddrkombat.gif',
		'hooptydoop.gif',
		'skeleton.gif',
		'yeaaaaaaaah.gif',
		'ballsbeingtripped.gif',
		'discokombat.gif',
		'jiggly.gif',
		'somanydrugs.gif',
		'yepyepyepyepye.gif',
		'bearjammin.gif',
		'dogbooty.gif',
		'lazerseverywhere.gif',
		'swedenz.gif',
		'yesfist.gif',
		'biceptclappin.gif',
		'drinkupbro.gif',
		'licklick.gif',
		'telivision.gif',
		'yesss.gif',
		'biggidupbiggidup.gif',
		'epilepsy.gif',
		'likeapolaroid.gif',
		'terrifying.gif',
		'youdied.gif',
		'bingowings.gif',
		'epilepsydudes.gif',
		'mchammer.gif',
		'thisisbankaiworking.gif',
		'bookclub.gif',
		'fattyrave.gif',
		'mountaindewz.gif',
		'totallyrad.gif',
		'bootyspray.gif',
		'freshprince.gif',
		'newchampion.gif',
		'transformerbutton.gif',
		'casiomotherfucker.gif',
		'getsometapesyo.gif',
		'onlikedonkeykong.gif',
		'tronnnnn.gif'
	]
	
	var i = 0;
	
	function touchthis(){
	
		$('.js_mover').css('width', '0');
		$('.js_mover').animate({
		  width: '100%'
		}, 3000, function() {
			i++
			if (images.length == i){i=0;}
				
		  $('.js_fuckyeah').empty();

		  $('.js_fuckyeah').append('<img src="awesome/' + images[i] + '">');

		  $('.js_linky').attr('href', 'awesome/' + images[i] + '.gif');
		  $('.js_linky').text('' + images[i]);
		  
		  touchthis();
		  
		});
	}

	touchthis();

});