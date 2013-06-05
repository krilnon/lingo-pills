var
	terms = ['TPS report', 'audit', 'fax']

$(init)

function init(){
	$('#text-area').focus()
	displayTerms()
}

function displayTerms(){
	var $termList = $('<ul />', { id: 'term-list' })
	$.each(terms, function(i, term){
		$termItem = $('<li />', { text: term })
		$termList.append($termItem)
	})
	
	$('#term-area').append($termList)
}