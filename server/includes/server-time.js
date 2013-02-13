exports.run = function(args){
	var result = {'servertime': new Date()};
	args.callback(result);
}