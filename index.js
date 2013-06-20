var
	terms = ['TPS report', 'fax', '  auto', '  automatic', '  autocomplete', 'autocompletions']

$(init)

function init(){
	$('#text-area').focus()
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
}

function displayTerms(){
	var $termList = $('<ul />', { id: 'term-list' })
	$.each(terms, function(i, term){
		$termItem = $('<li />', { text: term })
		$termList.append($termItem)
	})
	
	$('#term-area').append($termList)
}

// check text-area content for terms
function checkTerms(editableObj) {
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
    
    for (var i = 0, childCounts = element.childNodes.length; i < childCounts; i++) {

        var child = element.childNodes[i];
        console.log(child.nodeName + " :" + child.nodeType);
        if (child.nodeType == 1) { // container

            if (child.nodeName == 'BUTTON') // skip button
                continue;
            highlightTerms(child);
        } else if (child.nodeType == 3) { // text element

            for (var j = 0; j < terms.length; j++) 
            {
                var term = terms[j];
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