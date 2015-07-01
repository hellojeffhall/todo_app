//
// IMPORTANT VARAIBLES
//

var sample_items = [
    {
        description: "Sleep early",
        isDone: "0",
        sequence: 1,
        id: 0
    },
    {
        description: "Clean kitchen",
        isDone: "0",
        sequence: 4,
        id: 1
    },
    {
        description: "Cook lunches for this week",
        isDone: "0",    
        sequence: 3,
        id: 2
    },
    {
        description: "Buy groceries",
        isDone: "0",
        sequence: 2,
        id: 3
    }
];

var data = ''; // The model that we work with in browser. Syncs with localStorage.

var list = document.getElementById("todo_list");
var new_item = document.getElementById("new_item");
new_item.addEventListener('keydown',function(ev){
    if (ev.keyCode===13){
        addItem();
    }
})

document.getElementById('reset_button').addEventListener('click', function(ev){
    localStorage.clear();
    localStorage_needsUpdate = false;
    localStorage_exists = '';
    location.reload();
    console.log('Reset Complete');
});

//
// HELPER FUNCTIONS
//

var next_x_avaliable = function(colname){
    // Really only useful for getting the next ID number or sequence number.
    
    console.log('Next ' + colname + ': ' + (reorder_list(data,colname)[data.length-1][colname] + 1));
    return parseInt(reorder_list(data,colname)[data.length-1][colname]) + 1;
};

var reorder_list = function (array_of_data, field_to_order_by) {
    return array_of_data.sort(function(a, b){
        return a[field_to_order_by] - b[field_to_order_by]; // if 'a' > 'b', this will
                                                            // reurn positive and b will go first.
    });
};

var cell_prep = function (el, text_value, id, colname) {
    el.appendChild(document.createTextNode(text_value));
    el.setAttribute('data-colname', colname);
    el.setAttribute('data-id',id);
    el.contentEditable=true;
    
    el.addEventListener('focus', function(ev){
        ev.target.setAttribute('data-value_original', ev.target.firstChild.nodeValue);
    });
    
    el.addEventListener('input', function(ev){
        ev.target.setAttribute('data-modified','true');
    });
        
    el.addEventListener('blur', function(ev){
        var cell = ev.target;
        var current_value = cell.firstChild.nodeValue;
        if(
            cell.getAttribute('data-modified') == 'true' &&
            cell.getAttribute('data-value_original') !== current_value
          ){
            // If this "cell" was modified, then
            // we need to save the change to the data object,
            // and note that our local storange needs updating.
            //
            console.log(cell.getAttribute('data-id') + ' updated');
        
            update_model(cell.getAttribute('data-id'), cell.getAttribute('data-colname'), current_value)
        }
        cell.setAttribute('data-value_original', '');
        cell.setAttribute('data-modified', 'false');
    });

};

var update_model = function(id, colname, newValue){
    for (var i=0; i<data.length; i++){
        if(data[i].id==id){
            console.log('Updating ' + colname + ' where id=' + id + ' for newValue=' + newValue);
            data[i][colname] = newValue;
            localStorage_needsUpdate = true;
            break;
        }
    }
};


var render_list = function () {
    //
    // First, clear out the list if it exists.
    // Later, we should only redraw elements that need to be updated,
    // added, or deleted. For now, this works.
    //
    list.innerHTML='';
    
    // Get our rows from the model.
    
    var allRows = reorder_list(data, 'sequence').map(function(temp_object, i){
        
        var description = document.createElement('td')
        cell_prep(description, temp_object.description, temp_object.id, 'description');

        var sequence = document.createElement('td')
        cell_prep(sequence, temp_object.sequence, temp_object.id, 'sequence');
        
        var row = document.createElement('tr');
        row.appendChild(description);
        row.appendChild(sequence);
        return row;
    });
    
    // Add each row to the table.
    
    for (var i =0; i < allRows.length; i++){
        list.appendChild(allRows[i]);   
    }
};

var addItem = function(){
    //
    // Add a new object to the model, and 
    // clear out the data entry field.
    //

    var new_item_object =     
        {
            description: new_item.value,
            isDone: "0",
            sequence: next_x_avaliable('sequence'),
            id: next_x_avaliable('id')
        };
    
    data.push(new_item_object);
    localStorage_needsUpdate = true;

    new_item.value = '';
    render_list();
    new_item.focus();
};

//
// START THE APPLICAITON
//

// Make sure that there is something in our local storage. If there
// isn't, add the sample data. 
// (In production, we would get data from the server anyway.)

if(localStorage != undefined){
    var localStorage_exists = true;
    if(localStorage.getItem('populated') != '1'){
        console.log('Setting local storage: initial load.');
        localStorage.setItem('data' , JSON.stringify(sample_items));
        localStorage.setItem('populated' , '1');
        localStorage_needsUpdate = false;

    }
    data = JSON.parse(localStorage.getItem('data'));
}

//
// Make sure that we will update the localStorage before leaving
// the page. 
// Later, we can have this update with the server.
//

window.addEventListener('beforeunload', function () {
    if(localStorage_needsUpdate !== false){
        localStorage.setItem('data',JSON.stringify(data));
    }
});

// Draw the initial todo list.
render_list();
