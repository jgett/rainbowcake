exports.run = function(args){
	var session = args.session;
	var data = args.data;
	var callback = args.callback;
	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) {
		//stdout will always end with a pwd
		var splitter = stdout.split('\n');
		//-2 because the last element is always an empty string
		session.pwd = splitter[splitter.length-2];
		stdout = '';
		for (x=0;x<splitter.length-2;x++){
			stdout += splitter[x]+'\n';
		}
		callback({'stdout': stdout, 'stderr': stderr, 'error': error});
	}
	var fullcmd = data+';pwd';
	var opts = {};
	if (session.pwd)
		opts = {cwd: session.pwd};
	exec(fullcmd, opts, puts);
}