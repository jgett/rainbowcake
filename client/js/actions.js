(function($){
	var actions = $.rainbowcake.actions();
	
	actions.start = {
		'name': 'Start'
		,'createContent': function(p){
			p.content().html('');
			var divider = '';
			var clickHandler = function(event, key){
				event.preventDefault();
				p.action(key).createContent();
			}
			$.each(actions, function(key, value){
				if (key != 'start'){
					var link = $('<a/>').css('margin', '5px')
						.attr('href', '#').html(value.name)
						.on('click', function(event){clickHandler(event, key);})
					p.content().append(divider).append(link);
					divider = '|';
				}
			});
		}
		,'resize': function(p, event, ui){

		}
	};
	
	$.rainbowcake.actions().terminal = {
		'command': null
		,'terminal': null
		,'buffer': null
		,'bufferReset': function(){
			this.buffer = '# ';
			this.command.val(this.buffer);
		}
		,'name': 'Terminal'
		,'createContent': function(p){
			this.buffer = '# ';
			var cmd = $('<input type="textbox" class="command" />')
				.css({'background-color': '#000000', 'color': '#00FF00', 'width': '100%', 'height': '20px', 'border': 'none', 'margin': '0', 'font-family': 'courier new', 'font-size': '8pt'});
			var term = $('<div class="terminal" />')
				.css({'background-color': '#000000', 'color': '#00FF00', 'width': '100%', 'border': 'none', 'margin': '0', 'font-family': 'courier new', 'font-size': '8pt', 'position': 'relative', 'overflow': 'auto'})
				.append($('<div/>').addClass('text').css({'position': 'absolute', 'bottom': 0, 'left': 0}));
			p.content().html('')
				.append(term)
				.append(cmd);
			var self = this;
			cmd.focus().val(self.buffer).on('keyup', function(event){
				var val = $(this).val();
				if (val.substr(0, 2) != '# '){
					$(this).val(self.buffer);
					event.preventDefault();
				}
				else{
					self.buffer = val;
				}
			}).on('keydown', function(event){
				var val = $(this).val();
				if (val.length == 2 && event.keyCode == 8)
					event.preventDefault();
				else if (event.keyCode == 13){
					$('.text', self.terminal).append($('<div/>').html(self.buffer));
					var enteredCommand = self.buffer.substr(2);
					if (enteredCommand == 'exit')
						p.close();
					else if (enteredCommand != ''){
						p.serverRequest({
							'data': {'id': 'terminal', 'command': 'shell-exec', 'data': enteredCommand},
							'success': function(json){
								if (json.stdout != '')
									$('.text', self.terminal).append($('<div style="color: #FFFFFF;"/>').html(json.stdout.replace(/\n/g, '<br />')));
								if (json.stderr != '')
									$('.text', self.terminal).append($('<div style="color: #FF0000;"/>').html(json.stderr.replace(/\n/g, '<br />')));
								self.bufferReset();
							}
						});
					}
					else 
						self.bufferReset();
				}
			});
			term.height(p.content().height()-cmd.outerHeight());
			this.command = cmd;
			this.terminal = term;
		}
		,'resize': function(p, event, ui){
			this.terminal.height(p.content().height()-this.command.outerHeight());
		}
	};
	
	$.rainbowcake.actions().demo = {
		'output': null
		,'name': 'Demo'
		,'createContent': function(p){
			p.content().html('');
			var output = $('<div/>').addClass('output').css({'padding': '10px', 'overflow': 'auto'});
			function makeRequest(){
				p.serverRequest({
					'data': {'id': 'demo', 'command': 'server-time'},
					'success': function(json){
						output.append($('<div/>').html(json.servertime));
					}
				});
			}
			var link = $('<a/>').html('here').attr('href', '#')
				.on('click', function(event){
					event.preventDefault();
					makeRequest();
				});
			$('<div/>').html('Hello World!').css('padding', '5px')
				.append($('<div/>').append('Click ').append(link).append(' to check the current server time'))
				.append(output)
				.appendTo(p.content());
			this.output = output;
			this.resize(p);
		}
		,'resize': function(p, event, ui){
			this.output.outerHeight(p.content().height()-50);
		}
	};
}(jQuery));