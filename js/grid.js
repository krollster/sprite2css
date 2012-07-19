$(document).ready(function()
{
	// default options
	var opts_drag = 
	{
		containment: "parent",
		create: function(evt)
		{
			updateCSS(evt);
		},
		start: function(evt)
		{
			updateCSS(evt);
		},
		drag: function(evt)
		{
			updateCSS(evt);
		},
		stop: function(evt)
		{
			updateCSS(evt);
		}
	}

	var opts_resize =
	{
		containment: "parent",
		autoHide: true,
		resize: function(evt)
		{
			updateSize(evt);
			updateCSS(evt);
		}
	}

	// cloneable elements
	var $box = $('<div class="resizable draggable" title="Double-click to remove"></div>');
	var $sprite_css = $('<code>');

	// trackers
	var box_count = 1;

	// utils
	function updateCSS(evt)
	{			
		var $el = $(evt.target);
		var p	= $el.position();
		var id	= $el.attr('id').replace('drag_','');
		var $t	= $('#drag_' + id + '_sprite');
		var css_selector = ($t.data('css_selector'))? $t.data('css_selector') : '#drag_' + id + '_sprite';

		var left = (p.left == 0)? 0 : ('-' + parseInt(p.left) + 'px');
		var top = (p.top == 0)? 0 : ('-' + parseInt(p.top) + 'px');

		$t.html(css_selector + ' { width: ' + $('#box_w').val() + 'px; height: ' + $('#box_h').val() + 'px; background-position: ' + left + ' ' + top + '; }');
	}

	function updateSize(evt)
	{
		var w, h;
		var $el = $(evt.target);

		// set w/h, compensated for border
		w = parseInt($el.css('width').replace('px', '')) + 1;
		h = parseInt($el.css('height').replace('px', '')) + 1;

		$('#box_w').val(w);
		$('#box_h').val(h);
	}

	function highlightCSS(evt)
	{

		var el  = evt.currentTarget;			
		var id	= $(el).attr('id').replace('drag_','');
		var $t	= $('#drag_' + id + '_sprite');

		$t.toggleClass('active');
	}

	function highlightBox(evt)
	{
		var id	= $(evt.currentTarget).attr('id').replace('_sprite','');
		var $t	= $('#' + id);

		$t.toggleClass('active');
	}

	// handler binding
	$('#new_box').bind('click', addBox);

	$(document).on(
	{
		mouseenter: function(evt)
		{	
			highlightCSS(evt);
		},
		mouseleave: function(evt)
		{
			highlightCSS(evt);
		},
		dblclick: function(evt)
		{
			removeBox(evt);
		}
	}, '.draggable');

	$(document).on(
	{
		mouseenter: function(evt)
		{	
			highlightBox(evt);
		},
		mouseleave: function(evt)
		{
			highlightBox(evt);
		}
	}, '#css code');

	// handler fns
	function addBox()
	{	
		// setup common id
		var id = box_count;

		// clone
		var $clone_box = $box.clone();

		// clone css line
		var $clone_sprite_css = $sprite_css.clone();

		// preset w/h, compensated for border
		var w = parseInt( $('#box_w').val() - 1); 
		var h = parseInt( $('#box_h').val() - 1);

		// append cloned elements
		$('#grid').append($clone_box);
		$('#css').append($clone_sprite_css);

		// set attributes & styles
		$clone_box.attr('id', 'drag_' + id);
		$clone_box.css(
		{
			position: 'absolute',
			top: 0,
			left: 0,
			width: w + 'px',
			height: h + 'px'
		});

		// quick fade to highlight where the element was added
		$clone_box.css('backgroundColor', "#FBCB09").animate({backgroundColor:"transparent"}, 1000, null, function() 
		{ 
			$(this).css('backgroundColor', 'transparent'); 
		});


		// store custom id/class for css output
		$clone_sprite_css.attr('id', 'drag_' + id + '_sprite');
		$clone_sprite_css.data('css_selector', $('#box_css').val().trim());

		// set default rule
		$clone_sprite_css.html( $clone_sprite_css.data('css_selector') + ' { }');

		// prep box (handlers)
		var usr_opts_drag = $.extend({}, opts_drag);

		if ( $('#box_snap').is(':checked') )
		{
			usr_opts_drag = $.extend(usr_opts_drag, 
			{
				snap: true,
				snapTolerance: 5,
				snapMode: 'outer'
			});
		}
		$clone_box.draggable(usr_opts_drag).resizable(opts_resize);

		box_count++;		
	}

	// parent grid should be resizable too
	$("#grid").resizable();
});

function removeBox(evt)
{
	if ( confirm('Remove this box?') )
	{
		var $el = $(evt.currentTarget)
		var id	= $el.attr('id').replace('drag_','');
		var $css = $('#drag_' + id + '_sprite');

		// remove CSS rules and box element
		$css.remove();
		$el.remove();
	}	
}

// drag & drop uploading (see: http://www.thecssninja.com/demo/drag-drop_upload)
var DD = {};
var dropzone;

DD.setup = function ()
{
	dropzone = document.getElementById('grid');
	dropzone.addEventListener("dragenter", function(event){ event.stopPropagation();event.preventDefault();}, false);
	dropzone.addEventListener("dragover", function(event){ event.stopPropagation();event.preventDefault();}, false);
	dropzone.addEventListener("drop", DD.dropHandler, false);
}

DD.dropHandler = function (event)
{
	var dt = event.dataTransfer,
		files = dt.files,
		count = files.length;

	event.stopPropagation();
	event.preventDefault();

	//console.log(dt);

	for (var i = 0; i < count; i++) 
	{
		if(files[i].size < 1048576) 
		{
			var file = files[i],
				droppedFileName = file.name,
				reader = new FileReader();
				reader.index = i;
				reader.file = file;

			//console.log('File: ' + file.name + ' (' + file.type + ' ' + file.size + ')');

			reader.addEventListener("loadend", DD.attachBG, false);
			reader.readAsDataURL(file);
		} 
		else 
		{
			alert("file is too big, needs to be below 1mb");
		}
	} // end for
}

DD.attachBG = function(event)
{		
	var post = 
	{
		filename: event.target.file.name,
		data: event.target.result
	};

	$.post('upload.php', post, function()
	{
		$('#grid').prepend('<img src="uploads/' + post.filename + '" />');
	});
}

window.addEventListener('load', DD.setup, false);