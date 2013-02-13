//console.log(require('node-sqlite3'));
var express = require('express');
var server = express();

server.use(express.bodyParser());
server.use(express.cookieParser());
server.use('/js', express.static(__dirname+'/client/js'));
server.use('/css', express.static(__dirname+'/client/css'));
server.use('/images', express.static(__dirname+'/client/images'));

var sessions = {};
var sessionIndex = 1000000000;

var htmlWriter = function(){
	this.html = '';
	this.append = function(line){
		this.html += line + '\n';
		return this;
	}
}

var createPage = function(session){
	return new htmlWriter()
		.append('<!DOCTYPE html>')
		.append('<html>')
		.append('<head>')
		.append('<title>RainbowCake</title>')
		.append('<link rel="stylesheet" type="text/css" href="/js/jquery-ui-1.10.0.custom/css/smoothness/jquery-ui-1.10.0.custom.min.css" />')
		.append('<link rel="stylesheet" type="text/css" href="/css/themes/default/rainbowcake.css" />')
		.append('<script type="text/javascript" src="/js/jquery-1.9.1.min.js"></script>')
		.append('<script type="text/javascript" src="/js/jquery-ui-1.10.0.custom/js/jquery-ui-1.10.0.custom.min.js"></script>')
		.append('<script type="text/javascript" src="/js/jquery.rainbowcake.js"></script>')
		.append('<script type="text/javascript">')
		.append('(function($){$.rainbowcake.session('+JSON.stringify(session)+').actions({});}(jQuery))')
		.append('</script>')
		.append('<script type="text/javascript" src="/js/actions.js"></script>')
		.append('<script type="text/javascript" src="//lnf-jgett.eecs.umich.edu/demo/js/rainbowcake-actions.js"></script>') //TODO: replace this with stored data
		.append('<script type="text/javascript" src="/js/client.js"></script>')
		.append('</head>')
		.append('<body>')
		.append('<div class="rainbowcake">')
		.append('</div>')
		.append('</body>')
		.append('</html>')
		.html;
}

var message = function(code){
	var result = '';
	switch (code){
		case '1':
			result = 'Invalid username or password';
			break;
		default:
			result = 'An unknown problem occurred.';
			break;
	}
	return result;
}

var createLogin = function(code){
	var msg = '';
	if (define(code, '') != '')
		msg = '<div class="login-error">'+message(code)+'</div>';
	return new htmlWriter()
		.append('<!DOCTYPE html>')
		.append('<html>')
		.append('<head>')
		.append('<title>RainbowCake Login</title>')
		.append('<link rel="stylesheet" type="text/css" href="/css/themes/default/rainbowcake.css" />')
		.append('</head>')
		.append('<body>')
		.append('<div class="rainbowcake-login">')
		.append('<form method="POST" action="/">')
		.append('<input type="hidden" name="command" value="login" />')
		.append('<div class="label">Username</div>')
		.append('<div class="control"><input type="textbox" name="username" value="" /></div>')
		.append('<div class="label">Password</div>')
		.append('<div class="control"><input type="password" name="password" value="" /></div>')
		.append('<div class="button"><input type="submit" value="Sign In" /></div>')
		.append(msg)
		.append('</form>')
		.append('</div>')
		.append('</body>')
		.append('</html>')
		.html;
}

var define = function(x, y){
	return (typeof x == 'undefined') ? y : x;
}

var createSession = function(callback){
	var session = {'id': (sessionIndex).toString(36), 'pwd': null};
	sessionIndex += 1;
	commands('shell-exec')
		.session(session)
		.data('pwd')
		.execute(function(result){
			sessions[session.id] = session;
			callback(session);
		});
}

var handleLogin = function(post, callback){
	var result = {'success': true, 'code': ''}
	
	callback(result);
}

var loadMain = function(res){
	createSession(function(session){
		res.send(createPage(session));
	});
}

var commands = function(name){
	var session = null;
	var data = null;
	//all includes must export a run function that takes an object paramter
	//that looks like this: {'session':object,'data':variant,'callback':function}
	var exec = require('./server/includes/'+name+'.js');
	return {
		'execute': function(callback){
			exec.run({
				'session': session,
				'data': data,
				'callback': function(result){
					result.session = session;
					callback(result);
				}
			});
		}
		,'session': function(s){
			if (typeof s == 'undefined')
				return session;
			session = s;
			return this;
		}
		,'data': function(d){
			if (typeof d == 'undefined')
				return data;
			data = d;
			return this;
		}
	};
}

server.get('/', function(req, res){
	var token = define(req.cookies.rainbowcake_token, '');
	if (token == '') res.redirect('/login');
	loadMain(res);
});

server.post('/', function(req, res){
	if (req.body.command == 'login'){
		handleLogin(req.body, function(result){
			if (result.success) loadMain(res)
			else res.redirect('/login/?code='+result.code)
		});
	}
});

server.get('/login', function(req, res){
	res.clearCookie('rainbowcake_token');
	res.send(createLogin(req.query.code));
});

server.post('/ajax', function(req, res){
	var session = define(sessions[req.body.session.id], {});
	var data = define(req.body.data, {});
	commands(req.body.command)
		.session(session)
		.data(data)
		.execute(function(result){
			res.set('Content-Type', 'application/json');
			res.send(result);
		});
});

var serverPort = 8080

server.listen(serverPort);

console.log("RainbowCake server running at http://127.0.0.1:"+serverPort+"/");