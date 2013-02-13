(function($){
	
	var _session = null;
	var _actions = null;
	
	$.rainbowcake = {
		'session': function(s){
			if ((typeof s != 'undefined' && s != null)){
				_session = s;
				return this;
			}
			else
				return _session;
		}
		,'actions': function(a){
			if (typeof a == 'string')
				return _actions[a];
			else if (typeof a == 'undefined' || a == null)
				return _actions;

			_actions = a;
			return this;
		}
	};
	
	$.fn.rainbowcake = function(){
		
		var serverRequest = function(args){
			var a = $.extend({}, {'data': {}, 'success': null, 'error': null}, args);
			a.data.session = $.rainbowcake.session();
			$.ajax({
				'url': '/ajax',
				'type': 'POST',
				'dataType': 'json',
				'data': a.data,
				'success': function(json){
					if (typeof a.success == 'function')
						$.rainbowcake.session(json.session);
						a.success(json);
				},
				'error': function(err){
					if (typeof a.error == 'function')
						a.error(err);
				}
			});
		}
	
		return this.each(function(){
			var $this = $(this);
			
			var configure = function(p){
				p().addClass('popup')
					.on('click', function(event){
						event.stopPropagation();
						$('.popup', $this).css('z-index', 0);
						p().css('z-index', 1);
					})
					.append(
						$('<div/>')
							.addClass('title-bar')
							.addClass('drag')
							.append($('<div/>').addClass('text'))
							.append(
								$('<div/>')
									.addClass('popup-closer')
									.html('x')
									.on('click', function(event){
										event.stopPropagation();
										p.close();
									})
							)
					)
					.append(
						$('<div/>')
							.addClass('content')
					)
					.append(
						$('<div/>')
							.addClass('status-bar')
							.addClass('drag')
							.append($('<span/>').addClass('text'))
					)
					.draggable({'handle': '.drag'})
					.resizable({
						'resize': function(event, ui){
							p.resize(event, ui);
						}
						,'minWidth': 100
						,'minHeight': 100
					})
					.css({'position': 'absolute', 'z-index': 1});
				return p;
			}
			
			function popup(instance){
				var self = function(){
					return instance;
				}
				self.action = function(t){
					if (t){
						instance.data('action', t);
						return self;
					}
					else
						return instance.data('action');
				}
				self.titleBar = function(){
					return instance.find('.title-bar');
				}
				self.titleBarText = function(text){
					if (text){
						self.titleBar().find('.text').html(text);
						return self;
					}
					else
						return self.titleBar().find('.text').html();
				}
				self.statusBar = function(){
					return instance.find('.status-bar');
				}
				self.statusBarText = function(text){
					if (text){
						self.statusBar().find('.text').html(text);
						return self;
					}
					else
						return self.statusBar().find('.text').html();
				}
				self.content = function(){
					return instance.find('.content');
				}
				self.resize = function(event, ui){
					self.content().height(
						instance.height()-self.titleBar().outerHeight()-self.statusBar().outerHeight()
					);
					$.rainbowcake.actions(self.action()).resize(self, event, ui);
					return self;
				}
				self.createContent = function(){
					var action = $.rainbowcake.actions(self.action());
					if (typeof action != 'undefined'){
						if (typeof action.name == 'undefined' || action.name == '')
							self.titleBarText(self.action());
						else
							self.titleBarText(action.name)
						action.createContent(self);
					}
					return self;
				}
				self.serverRequest = function(args){
					serverRequest(args);
				}
				self.close = function(){
					instance.remove();
				}
				return configure(self);
			}
			
			var createPopup = function(options){
				var defopt = {top: 50, left: 50, width: 350, hieght: 200, action: 'start', callback: null};
				var opt = $.extend({}, defopt, options);
				var i = $('<div/>').appendTo($this)
					.css({
						'top': opt.top+'px',
						'left': opt.left+'px',
						'width': opt.width+'px',
						'height': opt.height+'px'
					})
					.data('action', opt.action);
				var p = new popup(i);
				if (typeof opt.callback == 'function')
					opt.callback(p);
			}
			
			$this.append('<div style="font-style: italic; color: #AAAAAA; padding: 3px;" class="start-message">Click anywhere to start...</div>');
			
			$this.css({'position': 'relative'})
			$this.on('click', function(event){
				$('.start-message', $this).hide();
				createPopup({top: event.clientY, left: event.clientX, width: 500, height: 350, action: 'start', callback: function(p){
					p.createContent().resize();
				}});
			});
		});
	}
}(jQuery));