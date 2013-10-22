$(document).on('ready',inicio);

function inicio(){
	_el=$('.CNTL span,a.developers');

	
	var staDentro=false;
	_el.on('mouseenter',function(){

		$('.cajita').not($('.cajita',this)).fadeOut('fast');

		staDentro=true;

		if($('.cajita',this).length)
			return $('.cajita',this).stop(true,true).fadeIn('fast');

		var foto_perfil=$(this).data('foto'),
			twitter=$(this).data('twitter'),
			github=$(this).data('github');

		$(this).append($('<div class="cajita">').append('<div class="img">',$('<div class="buttons">').append('<a target="_blank">Twitter</a>','<a target="_blank">Github</a>')));

		$(this)
			.find('.img').append('<img src="'+foto_perfil+'" alt="" />')
			.end()
			.find('.buttons')
							.find('a:eq(0)').attr('href','http://twitter.com/'+twitter)
							.end()
							.find('a:eq(1)').attr('href','http://github.com/'+github);
							
			$('.cajita',this).fadeIn('fast');
		
	});
	_el.on('mouseleave',function(){

		var obj=$(this);
		staDentro=false;
		setTimeout(function(){
			if(!staDentro)
				$('.cajita',obj).stop(true,true).fadeOut('fast');			
		},300);


	});



}

//MeetUP JAVASCRIPT

var mup_widget = {
    with_jquery: function(block) {
        block(jQuery, document.body);
    },
    api_call: function(path, params) {
        return "http://api.meetup.com" + path + "?callback=?&" + jQuery.param(jQuery.extend({ key: $api_key }, params));
    }
};

//Config MeetUP


var $queries = {
	groups: function() {
		return mup_widget.api_call("/2/groups", {group_urlname: $parameters.urlname});
	},
	events: function() {
		return mup_widget.api_call("/2/events", {group_urlname: $parameters.urlname, page: '1'});
	}
};

mup_widget.with_jquery(function($, ctx) {
	var group = '',
	months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],

	addLeadingZero = function( num ) {
		return (num < 10) ? ('0' + num) : num;
	},
	getFormattedDate = function( millis ) {
		var date = new Date( millis );
		return  months[date.getMonth()] + ' ' + addLeadingZero( date.getDate() ) + ', ' + date.getFullYear().toString();
	},
	getFormattedTime = function( millis ) {
		var time = new Date( millis ),
		hours = time.getHours(),
		min = time.getMinutes(),
		ampm = (hours > 11) ? 'PM' : 'AM';
		min = (min < 10) ? ('0' + min) : min;
		hours = (hours == 0) ? 1 : hours;
		hours = (hours > 12) ? hours-12 : hours;
		return hours + ':' + min + ' ' + ampm;
	},

	numberFormat = function(nStr){
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1))
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		return x1 + x2;
	};

	$.getJSON($queries.groups(), function(data) {
		if (data.results.length == 0) {
			$('.Bloquesote').html('Oops. Ocurrio un error al cargar los datos de: "' + $parameters.urlname);
		}
		else {
			group = data.results[0];
			var link=group.link,
				miembros=numberFormat(group.members),
				miembrosTag=group.who;

			$('.Bloquesote')
							.find('.cntBoton a').attr('href',link).end()
							.find('#viejas').find('.tx').html('<span class="icon">v</span>'+miembrosTag).end().find('.tx2').html(miembros);

			$.getJSON($queries.events(), function(data) {
				if (data.status && data.status.match(/^200/) == null) {
					alert(data.status + ": " + data.details);
				} else {
					if (data.results.length == 0) {
						//Sugerir Ideas
					} else {
						var event = data.results[0];
						var venue = event.venue;
						var city;
						if (!venue || !venue.city) {
							city = group.city;
						} else {
							city = venue.city;
						}
						var state_country;
						if (!venue || !venue.state) {
							if (group.state == "") {
								state_country = group.country.toUpperCase();
							} else {
								state_country = group.state;
							}
						} else {
							state_country = venue.state;
						}
						var venue_addr;
						if (venue) {
							if (venue.name !== undefined) {
								venue_addr = venue.name  + " - ";
							} else if (venue.address_1 !== undefined) {
								venue_addr = venue.address_1 + " - ";
							} else {
								venue_addr = "";
							}
						} else {
							venue_addr = "";
						}
						var location = venue_addr + city + ", "+venue.address_1 ;
						$('.Bloquesote')
										.find('#tema .tx2').html(event.name).end()
										.find('#cuando .tx2').html('<span>'+getFormattedDate(event.time) + '</span> a las <span>' + getFormattedTime(event.time)+ '</span>').end()
										.find('#donde .tx2').html(location)
							
					}
				}
			});
		}
	});
});