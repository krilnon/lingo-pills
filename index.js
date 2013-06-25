var
	terms = ['TPS report', 'fax', '  auto', '  automatic', '  autocomplete', 'autocompletions'];

$(init);

function insertNodeAtCursor(node) {
    var sel, range, html;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( node );
        }
    } else if (document.selection && document.selection.createRange) {
        //document.selection.createRange().text = text;
    }
}

function init(){
	$('#text-area').focus();
	displayTerms();

	$('body').on('focus', '[contenteditable]', function() {
		var $this = $(this);
		$this.data('before', $this.html());
		return $this;
	}).on('blur keyup paste', '[contenteditable]', function() {
		var $this = $(this);
		if ($this.data('before') !== $this.html()) {
			$this.data('before', $this.html());
			$this.trigger('change');
		}
		return $this;
	});

    checkTerms(document.getElementById('text-area'));
    // highlightTerms(document.getElementById('text-area'));
	$('[contenteditable]').bind('change', function() {
		checkTerms(this);
	});	
  
	$('[contenteditable]').keypress(function(e) {
      // only @ and + characters
		if ( (e.keyCode != 64) && (e.keyCode != 43) ) 
        return;
      e.preventDefault();
      var element = this;
      var node =
          $("<input />")
             .val('')
             .css({
               border: '0px',
               background: 'transparent',
               outline: 'none',
               margin: 0,
               padding: '0 0 0 0',
               lineHeight: $(element).css('line-height'),
               fontSize: $(element).css('font-size'),
               display: 'inline',
               verticalAlign: 'baseline',
               width: 'auto',
               color: $(element).css('color'),
               minWidth: '10px'
             })
             .attr("tabindex", -1)
             .attr("contenteditable", false)
      ;
      insertNodeAtCursor(node[0]);
     
      element.isAutoCompleting = true;
      function stopEditing() {
        element.isAutoCompleting = false;
        node.before( node.val() );
        node.remove();
        checkTerms(element);
      }
      
      // get width
      function resizeInput() {
         var span = $("<span />");
         var escaped = node.val().replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
         span.html(escaped);
         span.insertAfter(node);
         var exactW = span.width();
         exactW += 10;
         node.css('width', exactW+'px');
         span.remove();
      }
     
      node
         .blur(stopEditing)
         .keypress(function (event) {
           if ( (event.keyCode != 13) )
             return;
           event.preventDefault();
           stopEditing();
           return false;
         })
         .keyup(resizeInput)
         .keydown(resizeInput)
         .autocomplete({
            source: terms,
            minLength: 0,
            position: {
              //collision: "flipfit"
              my: "left top",
              at: "left bottom",
              collision: "fit flip"
            },
            select: function( event, ui ) {
              //console.log(event, ui);
              $(this).val( ui.item.value );
              stopEditing();
            },
            close: function( event ) {
              var ev = event.originalEvent;
              if (!ev) 
                stopEditing();
              if ( ev.type === "keydown" && ev.keyCode === $.ui.keyCode.ESCAPE ) {
                stopEditing();
              }
            }
         })
         .focus(function () {
           resizeInput();
           if (this.value === "")
              $(this).autocomplete("search");
         })
         .focus()
      ;
     
      resizeInput();
      return false;
	});	
  
}

function displayTerms(){
	var $termList = $('<ul />', { id: 'term-list' });
   terms = $.map(terms, function(s, i){
      return s.replace(/(^ +| +$)/, '');
   });
	$.each(terms, function(i, term){
		$termItem = $('<li />', { text: term });
		$termList.append($termItem);
	});
	
	$('#term-area').append($termList);
}

// check text-area content for terms
function checkTerms(editableObj) {
  
    if (editableObj.isAutoCompleting)
      return;
  
    var savedSel;
    // store current sel
    if (rangy.hasOwnProperty('saveSelection'))
       savedSel = rangy.saveSelection();
    
    highlightTerms(editableObj);

    // Restore the original selection
    if (rangy.hasOwnProperty('restoreSelection'))
        rangy.restoreSelection(savedSel);
}

function highlightTerms(element) {
    
    if (element.isAutoCompleting)
      return;
  
    for (var i = 0, childCounts = element.childNodes.length; i < childCounts; i++) {

        var child = element.childNodes[i];
        //console.log(child.nodeName + " :" + child.nodeType);
        if (child.nodeType == 1) { // container

            if (child.nodeName == 'BUTTON') // skip button
                continue;
            highlightTerms(child);
        } else if (child.nodeType == 3) { // text element

            var _terms = terms.slice(0);
            _terms.sort(function (a, b){
              var aName = a.length;
              var bName = b.length; 
              return ((aName < bName) ? 1 : ((aName > bName) ? -1 : 0));
            });
          
            for (var j = 0; j < _terms.length; j++) 
            {
                var term = _terms[j];
                var index = child.data.indexOf(term);
                if (index >= 0) {
                    var newTerm = document.createElement('button');
                    $(newTerm).attr("tabindex", -1);
                    $(newTerm).attr("contenteditable", false);
                    $(newTerm).append("<span></span>" + term);
                    
                    child.splitText(index);
                    child.nextSibling.splitText(term.length);
                    child.parentNode.replaceChild(newTerm, child.nextSibling);

                    // recount child elements
                    childCounts = element.childNodes.length;
                }
            }
        }
    }
}