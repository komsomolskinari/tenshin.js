// kagura.js
// used to view game HS by DebonosuWorks in browser
// some core technology then used in tenshin.js
// originally designed work without web server
// but quickly I found it's too uncomfortable
Array.prototype.clean = function (deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};
String.prototype.format = function () {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
	});
};

function write_list() {
	$.getJSON("script/", function (data) {
		var items = [];
		$.each(data, (k, v) => {
			if (v.type != 'file') return;
			if (!v.name.match(/[a-z_]*[0-9]{2,}.*\.lua/)) return;
			items.push($("<option/>").val(v.name).text(v.name)[0]);
		});
		$("#list").html(items);
	});
}

var program;

var rt_zindex;
var rt_coord;
var rt_vars;

function fake_loader() {
	$.get('script/_visual.lua', (txt) => rt_coord = flrt_loadcoord(txt.split(/\r?\n/)));
	$.get('script/_variable.lua', (txt) => rt_vars = flrt_loadvar(txt.split(/\r?\n/)));

	$.get('script/{0}'.format($('#list').val()), (txt) => program = fake_pp(fake_c(txt.split(/\r?\n/))));
	fake_setenv();
}

// fake lua compiler(?!)
function fake_c(txt) {
	var buf;
	var cmd;
	var ign;
	var q = [];
	for (var n in txt) {
		cmd = [];
		buf = txt[n].toString();
		var t = cuttoken(buf);
		if (t[0]) {
			cmd.push(t[0]);
			ign = false;

			if (['name', 'playvoice', 'playmusic', 'stopvoice', 'stopmusic', 'if', 'function', 'scene', 'part', 'text', '_text', 'else', 'end', 'break', 'while', 'page'].includes(t[0])) {
				q.push(t);
			}
		}
	}
	return q;
}
function cuttoken(str) {
	return str.replace(/["'(),]/g, ' ').split(' ').clean('');
}


//fake lua preprocessor
function fake_pp(cmds) {
	for (var i in cmds) {
		cmd = cmds[i];
		if (cmds[i][0] == 'text' || cmds[i][0] == '_text' || cmds[i][0] == 'name') {
			for (var j = 1; j < cmds[i].length; j++)
				cmds[i][j] = cvtstr(cmds[i][j]);
		}
	}
	return cmds;
}

// lua multi-byte character string to javascript string
// modify encoding type in return statement to set original encoding
function cvtstr(str) {
	var buf = new Uint8Array(new ArrayBuffer(str.length));
	var p = 0;
	var w = 0;
	var ch;
	var int;
	while (p < str.length && w < str.length) {
		ch = str[p];
		if (ch == '\\') {
			int = parseInt(str.substring(p + 1, p + 4));
			if (isNaN(int)) {
				p++;
				buf[w] = ch.charCodeAt();
			}
			else {
				p += 4;
				buf[w] = int;
			}
		}
		else {
			p++;
			buf[w] = ch.charCodeAt();
		}
		w++;
	}
	var out = new Uint8Array(w);
	for (p = 0; p < w; p++) out[p] = buf[p];
	return new TextDecoder('sjis').decode(out);
}

var entries;
// fake bootloader
function fake_setenv() {
	var t = [];
	entries = [];
	for (var i in program) {
		if (program[i][0] == 'function') t.push(i);
	}
	for (var i = 0; i < t.length - 1; i++)
		if (t[i + 1] - t[i] > 16) entries.push(t[i]);
	if (t.length - t[t.length - 1] > 16) entries.push(t[i]);

	// TODO: select entry here
	pc = entries[0];
	pc++;
	variables = [];
	depth = 1;
	hang = true;
}


// vm control
var pc;
var variables;
var depth;
var hang;
// fake lua vm
function fake_vm() {
	hang = false;
	while (pc < program.length) {
		if (hang) return true;
		arg = program[pc].slice();
		console.log(arg);
		switch (arg[0]) {

			// if [var]
			case 'if': // if else end
				// ask for variable here
				depth++;
				if (variables[arg[1]] === undefined) {
					/*
					// not found, manually input
					flrt_getbool(arg[1]);
					hang = true;
					pc--; // so we can resume at same pc*/
					variables[arg[1]] = true;
				}
				else if (variables[arg[1]] != true) {
					// goto else
					if (!ignore_cmd_until('else')) return false;
					pc++; // skip else itself
				}
				// else run as normal
				break;
			case 'else': // you come from an if and exec the if stmt
				if (!ignore_cmd_until('end')) return false;
				break;
			case 'end': // end, pop fake stack
				depth--;
				if (depth === 0) return false; // stack check, no code is running
				break;
			case 'break': // break to next end
				if (!ignore_cmd_until('end')) return false;
				break;
			case 'while': // keep stack happy
				depth++;
				break;
			case 'function': // another function, you goes too far
				return false;
			default:
				flrt_call(arg);
		}
		pc++;
	}
}
function ignore_cmd_until(cmd) {
	for (; pc < program.length; pc++)
		if (program[pc][0] == cmd) {
			pc--; // so when vmloop end, pc point to that cmd
			return true;
		}
	return false;
}


// runtime library

// fake lua runtime functions
var rt_func = {
	'name': flrt_name,
	'playvoice': flrt_playvoice,
	'playmusic': flrt_playmusic,
	'stopvoice': flrt_stopvoice,
	'stopmusic': flrt_stopmusic,
	'scene': flrt_scene,
	'part': flrt_part,
	'text': flrt_text,
	'_text': flrt_text,
	'page': flrt_hang
}

function flrt_call(args) {
	rt_func[args[0]](args.splice(1));
}

function flrt_init() {
	//ask for coordinate file, _variable,
	rt_zindex = 0;
	flrt_text('please select coordinate file and click "load coordinate"');
	$('#coord').click(flrt_loadcoord);
	$('#continue').click(flrt_wait);
}
function flrt_name(arg) {
	$('#name').text(arg[0]);
}
function flrt_playvoice(arg) {
	$('#fgchannel').attr('src', 'voice/{0}.ogg'.format(arg));
	$('#fgchannel')[0].play();
}
function flrt_stopvoice(arg) {
	$('#fgchannel')[0].pause();
	$('#fgchannel')[0].currentTime = 0;
}
function flrt_playmusic(arg) {
	var id = rt_vars[arg[0]];
	if (id < 10) id = '0' + id;
	var ch = $('#bgchannel');
	ch.attr('src', 'music/bgm{0}a.wav'.format(id));
	ch[0].play();

	ch.on('ended',()=>{
		ch.attr('src', 'music/bgm{0}b.wav'.format(id));
		ch[0].play();
	});

}
function flrt_stopmusic(arg) {
	$('#bgchannel')[0].pause();
	$('#bgchannel')[0].currentTime = 0;
	$('#bgchannel').off('ended');
}
function flrt_scene(arg) {
	rt_zindex = 0;
	$("#crt").html('');
	$("#crt").append('<img src="bmp/visual/{0}.png" style="left:10px;top:10px;z-index: 0;position:fixed;" />'.format(arg[0]));
	flrt_part(arg.splice(1));
}
function flrt_part(arg) {
	for (var i = 1; i < arg.length; i++) {
		flrt_putfgimage(arg[i]);
	}
}
function flrt_putfgimage(fg) {
	rt_zindex++;
	$('#crt').append(
		'<img src="bmp/visual/{0}.png" style="left:{1}px;top:{2}px;z-index:{3};position:fixed"/>'
			.format(fg, rt_coord[fg][0] * 1 + 10, rt_coord[fg][1] * 1 + 10, rt_zindex));
	rt_zindex++;
}
function flrt_text(format) {
	$('#text').text(format);
}
function flrt_getbool(varname) {

}
function flrt_hang() {
	hang = true;
}


function flrt_continue() {
	if (hang) fake_vm();
}

function flrt_loadcoord(txt) {
	var ret = [];
	for (var l = 0; l < txt.length; l++) {
		if (txt[l].search(/patch/) != -1) {
			var t = cuttoken(txt[l]);
			ret[t[1]] = [t[t.length - 2], t[t.length - 1]];
		}
	}
	return ret;
}

function flrt_loadvar(txt) {
	var ret = [];
	var dep = 0;
	for (var l = 0; l < txt.length; l++) {
		var t = cuttoken(txt[l]);
		if (['function', 'if', 'while', 'for'].includes(t[0])) dep++;
		if (dep == 0 && t[0] !== undefined) ret[t[0]] = t[2];
		if (t[0] == 'end') dep--;
	}
	return ret;
}

$(document).ready(() => {
	write_list();
	$('#run').click(flrt_continue);
	$('#load').click(fake_loader);
});