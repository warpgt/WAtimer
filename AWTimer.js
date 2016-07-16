var AWTimer =
{
	_config: null,
	_version: 0.86,
	_items: [],
	
	_style : '<style type="text/css">\
	input[type="number"]{\
		width: 50px;\
		border:1px solid #000000;\
	}\
	div.displayRemainTime{\
		padding:5px;\
		font-size:20px;\
	}\
	small.version{\
		font-weight:bold;\
		cursor: help;\
	}\
	</style>',
	
	_pad: function (number, length) {
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	}
	,
	_displayFormat: function (d,h,i,s){
		var print='';
		if(d > 0){
			print += d+'d ';
		}

		if(h > 0){
			print += this._pad(h,2)+":";
		}

		if(i > 0){
			print += this._pad(i,2)+":";
		}else{
			print += '00:';
		}

		if(s > 0){
			print += this._pad(s,2);
		}else{
			print += '00';
		}

		print += "\n\r";

		return print;
	}
	,
	/* createsoundbite: function(sound)
	{
		var html5_audiotypes={
		//define list of audio file extensions and their associated audio types. Add to it if your specified audio file isn't on this list:
			"mp3": "audio/mpeg",
			"mp4": "audio/mp4",
			"ogg": "audio/ogg",
			"wav": "audio/wav"
		}

		var html5audio=document.createElement('audio');
		if (html5audio.canPlayType){ //check support for HTML5 audio
			for (var i=0; i<arguments.length; i++){
				var sourceel=document.createElement('source');
				sourceel.setAttribute('src', arguments[i]);
				if (arguments[i].match(/\.(\w+)$/i)){
					sourceel.setAttribute('type', html5_audiotypes[RegExp.$1]);
				}
				html5audio.appendChild(sourceel);
			}
			html5audio.load();
			html5audio.playclip = function(){
				html5audio.pause();
				html5audio.currentTime = 0;
				html5audio.play();
			}
			return html5audio;
		}
		else{
			return {playclip:function(){throw new Error("Your browser doesn't support HTML5 audio unfortunately");}}
		}
	} ,*/
	_timeParse: function (time_ms){
		var c_time = {d:0,h:0,i:0,s:0};
		if(time_ms > 0){

			c_time.d = Math.floor(time_ms/1000/60/60/24);
			var dms = c_time.d*1000*60*60*24;
			var hours = time_ms-dms;

			c_time.h = Math.floor(hours/1000/60/60);
			var hms = c_time.h*1000*60*60;
			var minutes = hours-hms;

			c_time.i = Math.floor(minutes/1000/60);
			var ims = c_time.i*1000*60;
			var seconds = minutes-ims;

			c_time.s = Math.ceil(seconds/1000);
			var sms = c_time.s*1000;
			var mseconds = seconds-sms;
		}
		return c_time;
	}
	,
	isSupported: function (mediaType)
	{
		var lastDot = mediaType.lastIndexOf('.');
		if(lastDot != -1)
		{
			var ext = mediaType.substr(lastDot);

			var aCodec = [];
			aCodec['.wav'] = 'audio/wav; codecs="1"';
			aCodec['.mp3'] = 'audio/mpeg; codecs="mp3"';
			aCodec['.mp4 .m4a .aac'] = 'audio/mp4; codecs="mp4a.40.5"';
			aCodec['.oga .ogg'] = 'audio/ogg; codecs="vorbis"';
			
			/*
			var vType = [
				'video/ogg; codecs="theora, vorbis"',
				'video/mp4; codecs="avc1.4D401E, mp4a.40.2"',
				'video/webm; codecs="vp8.0, vorbis"'
			]
			*/

			var patt = new RegExp(ext,'i');
			var foundCodec = -1;
			
			for (var i in aCodec)
			{
				if(i.match(patt)){
					foundCodec = aCodec[i];
					break;
				}
			}
			
			if(foundCodec == -1){
				return false;
			}
			
			var support = (new Audio()).canPlayType(foundCodec);			
			return (support == '') ? false : true;
		}
		return false;
	}
	,
	init: function(config){
		
		this._config = config;
		
		if(this._config.soundFile.length > 0 && !this.isSupported(this._config.soundFile)){
			alert('Audio not supported');
			return;
		}
		
		this.createHtml();
		this.events();
	},
	
	createHtml : function(){
		
		var container = this._config.container;

		for(i in container)
		{
			if(typeof container[i] != 'object'){
				continue;
			}
			
			if(i == 0){
				container[i].innerHTML += this._style
			}
			
			var b_id = new Date().getTime();
			this._items.push({t: null, block_id: 'awt_'+b_id, left_ms: 0, sound : null});
			
			container[i].innerHTML += '\
			<div id="awt_'+b_id+'">\
				h:<input type="number" name="h" class="number hour" value="00" min="0" max="23" maxlength="2"/>\
				m:<input type="number" name="i" class="number minute" value="00" min="0" max="59" maxlength="2"/>\
				s:<input type="number" name="s" class="number second" value="00" min="0" max="59" maxlength="2"/>\
				<input type="button" class="btnStart" value="Start" onclick="return AWTimer.start(\'awt_'+b_id+'\');"/>\
				<input type="button" class="btnStop" value="Stop" onclick="return AWTimer.stop(\'awt_'+b_id+'\');"/>\
				<small class="version" title="Adamski Timer ver.: '+this._version+'">?</small>\
				<div name="display_remain_time" class="displayRemainTime"></div>\
			</div>';
		}
	},
	
	events : function(){

		for(i in this._items)
		{
			if(typeof this._items[i] != 'object'){
				continue;
			}
			
			var num = document.getElementsByClassName('number');
			for(j in num){
				num[j].onkeypress = function(event){
				
					if(this.value.length > 3){
						event.preventDefault();
						return false;	
					}
					
					var c = String.fromCharCode(event.which);
					if(/[^0-9]+/.test(c)){
						event.preventDefault();
						return false;
					}
				}
			}
		}
	},
	
	start : function(current_id)
	{
		for(i in this._items)
		{
			if(typeof this._items[i] != 'object'){
				continue;
			}
			
			var b_id = this._items[i].block_id;
			
			if(current_id != b_id){
				continue;
			}
			
			if(typeof document.getElementById(b_id) == 'undefined'){
				continue;
			}

			var h = parseInt(document.querySelectorAll('#'+b_id+' .hour')[0].value);
			var m = parseInt(document.querySelectorAll('#'+b_id+' .minute')[0].value);
			var s = parseInt(document.querySelectorAll('#'+b_id+' .second')[0].value);
		
			if(isNaN(h) || isNaN(m) || isNaN(s) || (h+m+s) <= 0){
				continue;
			}
			
			this._items[i].left_ms = ((h*60*60)+(m*60)+(s))*1000;
			
			clearTimeout(this._items[i].t);
		
			this.run(b_id);
			
			document.querySelectorAll('#'+b_id+' .btnStop')[0].value = "Stop";
		}
	},
	
	stop : function(current_id)
	{
		var block_item_id = -1;
		
		for(i in this._items)
		{
			if(typeof this._items[i] != 'object'){
				continue;
			}
			
			var b_id = this._items[i].block_id;
			
			if(current_id == b_id){
				block_item_id = i;
				break;
			}
		}
		
		if(this._items[block_item_id].t != null){
			clearTimeout(this._items[block_item_id].t);
			this._items[block_item_id].t = null;
			if(this._items[block_item_id].sound != null){
				this._items[block_item_id].sound.pause();
				this._items[block_item_id].sound.currentTime = 0;	
			}			
			
			document.querySelectorAll('#'+b_id+' .btnStop')[0].value = "Resume";
		}else{
			this._items[block_item_id].t = setTimeout(function(){
				AWTimer.run(current_id);
			},1000);
			document.querySelectorAll('#'+b_id+' .btnStop')[0].value = "Stop";
		}
	},
	
	run: function (current_id)
	{
		var block = null;
		for(i in this._items)
		{
			if(typeof this._items[i] != 'object'){
				continue;
			}
			
			if(current_id == this._items[i].block_id){
				block = this._items[i];
				break;
			}
		}
		
		if(typeof block != 'object'){
			return;
		}
		
		if(block.left_ms > 0){

			var c_time = this._timeParse(block.left_ms);

			document.querySelectorAll('#'+current_id+' .displayRemainTime')[0].innerHTML = this._displayFormat(c_time.d,c_time.h,c_time.i,c_time.s);
			
			if(this._items.length == 1 && block.block_id == current_id)
			{
				document.getElementsByTagName('title')[0].innerHTML = ((this._config.title.length > 0) ? this._config.title+' ': '')
				+ this._displayFormat(c_time.d,c_time.h,c_time.i,c_time.s);
			}
			
			this._items[i].left_ms -= 1000;
			
			this._items[i].t = setTimeout(function(){
				AWTimer.run(current_id);
			},1000);
		}else{
		
			this._items[i].sound = new Audio(this._config.soundFile); // buffers automatically when created
			this._items[i].sound.play();

			document.querySelectorAll('#'+current_id+' .displayRemainTime')[0].innerHTML =
				(this._config.expireMsg !== undefined && this._config.expireMsg.length > 0) ?
						this._config.expireMsg : "Up\u0142yno\u0142";
		}
	}
}