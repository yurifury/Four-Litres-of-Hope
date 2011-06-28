// use with $(input_element).clevertags();

// plugin template from http://css-tricks.com/snippets/jquery/jquery-plugin-template/
(function($){
	$.clevertags = function(el, options){
		// To avoid scope issues, use 'self' instead of 'this'
		// to reference this class from internal events and functions.
		var self = this;

		// Access to DOM version of element
		self.el = el;

		// Add a reverse reference to the DOM object
		$(self.el).data("clevertags", self);

		self.tags = new Array();
		self.dummy_input = null;
		self.input_for_server = null;
		self.original_name = null;

		// for dealing with left / right nav
		self.selected_tag = null;
		self.selected_autocomplete_tag = null;

		self.init = function(){
			// this is the per instance init. 
			self.options = $.extend({},$.clevertags.default_options, options);

			// first, make a dummy input field
			self.dummy_input = $('<input>', {type: 'text', 'class': 'clevertags_dummyinput', name: $(self.el).attr('name') + 'dummy', autocomplete: 'off'});
			$(self.el).before(self.dummy_input);
			// from now on, do things relative to the dummy input.

			// we assume that the value is comma separated.. this might be an option later. So create the initial boxes.
			var current_tags = $(self.el).val().split(',');
			for (var i = current_tags.length - 1; i >= 0; i--) {
				tag_text = $.trim(current_tags[i]);
				self.create_tag(tag_text);
			}

			// hokay, so most browsers don't let us change the type of a input element. But we _can_ make a new one with the same name as the old one
			// and then delete the old one.
			self.original_name = $(self.el).attr('name');
			self.create_input_for_server();

			// now lets add a focus selector. if we don't have one, then we'll just use the parent of the input. 
			var focus_trigger_el = (self.options.focus_selector) ? $(self.options.focus_selector) : $(self.el).parent(self.options.parent_focus_selector);
			focus_trigger_el.click(function () { $(self.dummy_input).focus() });
			// requires hotkeys!
			$(self.dummy_input).bind('keydown', 'return', self.create_tag_return);
			$(self.dummy_input).bind('keydown', ',', self.create_tag_keypress);
			$(self.dummy_input).bind('keyup', 'left', self.select_prev_tag);
			$(self.dummy_input).bind('keyup', 'right', self.select_next_tag);

			// auto complete key presses
			$(self.dummy_input).bind('keyup', 'down', self.select_next_autocomplete_tag);
			$(self.dummy_input).bind('keyup', 'up', self.select_prev_autocomplete_tag);
			
			// have keydown for backspace, so we can be sure we didn't just delete the last character
			$(self.dummy_input).bind('keydown', 'backspace', self.delete_selected_tag_keypress);
			$(self.dummy_input).keyup(self.prompt_autocomplete_key);
			
			// finally, remove the element itself, as we don't need it anymore.
			$(self.el).remove();
		};
		
		self.create_input_for_server = function() 
		{
			if (self.input_for_server)
			{
				self.input_for_server.remove();
			}
			
			self.input_for_server = $('<input>', {type: 'hidden', 'class': 'clevertags_actualinput', name: self.original_name});
			self.input_for_server.val(self.tags.join(','));
			self.dummy_input.before(self.input_for_server);
			
		}
		
		self.create_tag_return = function(e)
		{
			e.preventDefault();

			if (self.selected_autocomplete_tag)
			{
				self.create_tag(self.selected_autocomplete_tag.data('tag_text'));
			} else 
			{
				self.create_tag($(self.dummy_input).val());
			}
		};

		self.create_tag_keypress = function(e)
		{
			e.preventDefault();
			self.create_tag($(self.dummy_input).val());
		};

		self.create_tag = function(tag)
		{
			tag = jQuery.trim(tag);
			// detect and strip trailing commas
			if (tag.substring(tag.length - 1) == ',') 
			{ 
				tag = tag.substring(tag.length - 1, 0);
			}
			
			var new_tag = null;
			if (tag.length > 0)
			{
				self.tags.push(tag);
				new_tag = $('<span></span>').addClass('clevertags_tag').text(tag).append($('<a></a>', {href: '#'}).text('Delete').bind('click', self.delete_tag_click));
				$(new_tag).data('tag_text', tag);
				$(self.dummy_input).before(new_tag);
				$(self.dummy_input).val('');
				self.reset_autocomplete();
				self.create_input_for_server();
				$(self.el).trigger('clevertags.newtag', [self, tag]);
			}
		};

		self.delete_tag_click = function(e) 
		{
			self.delete_tag($(e.currentTarget).parent('.clevertags_tag').data('tag_text'));
			$(e.currentTarget).parent('.clevertags_tag').remove();
		};
		
		self.delete_selected_tag_keypress = function(e) {
			if (( ! self.selected_tag ) && ($(self.dummy_input).val() == ''))
			{
				// if there is no selected tag, but the input is empty, then delete the last tag.
				self.selected_tag = $(self.dummy_input).siblings('.clevertags_tag:last');
			}

			if (self.selected_tag)
			{
				// make the new selected the next one.
				var one_to_delete = self.selected_tag;
				self.select_next_tag();
				
				self.delete_tag($(one_to_delete).data('tag_text'));
				one_to_delete.remove();
			} 
		};
		
		self.delete_tag = function(tag) {
			var new_tags = new Array();
			for (var i = self.tags.length - 1; i >= 0; i--){
				if (self.tags[i] != tag)
				{
					new_tags.push(self.tags[i]);
				}
			};
			
			self.tags = new_tags;
			self.create_input_for_server();	
		};

		self.select_prev_tag = function() {

			// we only select the previous tag if we have no string. otherwise we allow the opteration
			if ($(self.dummy_input).val() == '')
			{
				// if we have already selected a tag, then go left.
				if (self.selected_tag == null)
				{
					self.selected_tag = $(self.dummy_input).siblings('.clevertags_tag:last');
					self.selected_tag.addClass('clevertags_selected');
				} else 
				{
					var prev = self.selected_tag.prev();
					if (prev.length > 0)
					{
						self.selected_tag = prev;
						$(self.dummy_input).siblings('.clevertags_tag').removeClass('clevertags_selected');
						self.selected_tag.addClass('clevertags_selected');
					}
				}
			}
		};
		
		self.select_next_tag = function() {

			// we only select the previous tag if we have no string. otherwise we allow the opteration
			if ($(self.dummy_input).val() == '')
			{
				// if we have already selected a tag, then go right.
				if (self.selected_tag != null)
				{
					var next = self.selected_tag.next();
					if (next.length > 0)
					{
						self.selected_tag = next;
						$(self.dummy_input).siblings('.clevertags_tag').removeClass('clevertags_selected');
						self.selected_tag.addClass('clevertags_selected');
					} else {
						self.selected_tag = null;
						$(self.dummy_input).siblings('.clevertags_tag').removeClass('clevertags_selected');
					}
				}
			}
		};
		
		self.prompt_autocomplete_key = function(e) {
			// first, arrows.
			var bad_keys = [37, 38, 39, 40];
			if ( jQuery.inArray(e.keyCode, bad_keys) == -1)
			{
				self.prompt_autocomplete();
			}
		}
		
		self.prompt_autocomplete = function() {
			if ($(self.dummy_input).val().length > self.options.autocomplete_minlength)
			{
				// two kinds of autocomplete, url, and pre-set list. We require one. Url overrides pre-set list.
				if (self.options.autocomplete_url)
				{
					// do an ajax call.
					// the callback should replace the options.autocomplete_tags object.
					var cb = (self.options.autocomplete_cb != null) ? self.options.autocomplete_cb : (function(response) {
						self.options.autocomplete_tags = response.data.clevertags_autocomplete_options;
						self.display_autocomplete();
					});

					$.getJSON(self.options.autocomplete_url, { clevertags_current: $(self.dummy_input).val()}, cb);
				} else if (self.options.autocomplete_tags) 
				{
					self.display_autocomplete();
				}
			} else 
			{
				self.reset_autocomplete();
			}
		};

		self.display_autocomplete = function()
		{
			var thewrap = $("<div></div>", {'class': 'clevertags_autocomplete_wrap'}).css($(self.dummy_input).position());
			var thelist = $("<ul></ul>");
			var theli = null;
			
			for (var i = self.options.autocomplete_tags.length - 1; i >= 0; i--){
				theli = $("<li></li>", {'class': 'clevertags_autocomplete_tag'}).data('tag_text', self.options.autocomplete_tags[i]);
				theli.append($("<a></a>", {href: '#', text: self.options.autocomplete_tags[i]}).click(self.use_autocomplete_click));
				thelist.append(theli);
			};
			
			self.reset_autocomplete();
			$(self.dummy_input).after(thewrap.append(thelist));
		};
		
		self.use_autocomplete_click = function(e) {
			e.preventDefault();
			self.use_autocomplete_tag($(e.currentTarget).parents('.clevertags_autocomplete_tag').data('tag_text'));
		};

		self.use_autocomplete_tag = function(tag) {
			self.create_tag(tag);
		};

		self.select_next_autocomplete_tag = function() {
			// we only do this is we have autocomplete showing.
			var auto_wrap = $(self.dummy_input).siblings('.clevertags_autocomplete_wrap');
			if (auto_wrap.length > 0)
			{
				// if we dont have a tag, do top one.
				if (self.selected_autocomplete_tag == null)
				{
					self.selected_autocomplete_tag = auto_wrap.find('.clevertags_autocomplete_tag:first');
					self.selected_autocomplete_tag.addClass('clevertags_autocomplete_selected');
				} else 
				{
					var next = self.selected_autocomplete_tag.next();
					if (next.length > 0)
					{
						self.selected_autocomplete_tag = next;
						self.selected_autocomplete_tag.siblings('.clevertags_autocomplete_tag').removeClass('clevertags_autocomplete_selected');
						self.selected_autocomplete_tag.addClass('clevertags_autocomplete_selected');
					}
				}
			}
		};
		
		self.select_prev_autocomplete_tag = function() {

			// we only do this is we have autocomplete showing.
			var auto_wrap = $(self.dummy_input).siblings('.clevertags_autocomplete_wrap');
			if (auto_wrap.length > 0)
			{
				// if we dont have a tag, do top one.
				if (self.selected_autocomplete_tag != null)
				{
					var prev = self.selected_autocomplete_tag.prev();
					if (prev.length > 0)
					{
						self.selected_autocomplete_tag = prev;
						self.selected_autocomplete_tag.siblings('.clevertags_autocomplete_tag').removeClass('clevertags_autocomplete_selected');
						self.selected_autocomplete_tag.addClass('clevertags_autocomplete_selected');
					} else {
						// we are at the top, we should deselect all of them so we can use enter to submit the typed text
						self.selected_autocomplete_tag.siblings('.clevertags_autocomplete_tag').removeClass('clevertags_autocomplete_selected');
						self.selected_autocomplete_tag.removeClass('clevertags_autocomplete_selected');
						self.selected_autocomplete_tag = null;
					}
				}
			}
		};
		
		self.reset_autocomplete = function() {
			$(self.dummy_input).siblings('.clevertags_autocomplete_wrap').remove();
			self.selected_autocomplete_tag = null;
		}

		// Run initializer
		self.init();
	};

	$.clevertags.default_options = {
		focus_selector: null,
		parent_focus_selector: null,
		autocomplete_tags: null,
		autocomplete_url: null,
		autocomplete_cb: null,
		autocomplete_minlength: 0
	};

	$.fn.clevertags = function(options){
		// this is the global init stuff. Mostly it's instance specific.
		return this.each(function(){
			(new $.clevertags(this, options));
		});
	};

})(jQuery);
