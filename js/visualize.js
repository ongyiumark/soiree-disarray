// Holds tree information
var bfsTree = new Object();
var heuristicTree = new Object();

// Add listeners to the tree
function addTreeListeners(){
    var toggler = document.getElementsByClassName("caret");
    var toggleidx;

    for (toggleidx = 0; toggleidx < toggler.length; toggleidx++) {
        toggler[toggleidx].addEventListener("click", function() {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        });
    }
}

function heuristicTreeHelper(state, idx, data){
    var li = document.createElement("LI");
    
    // Insert node name
    var span = document.createElement("SPAN");
    span.innerHTML = state;
    if (data != null) {
        span.innerHTML = `${data.state} (cost: ${data.weight}, score: ${data.score})`
    }
    span.setAttribute("class", "caret solution");
    if (idx+1 == heuristicSol.length) {
        span.setAttribute("class", "solution");
    }
    li.appendChild(span);

    var ul = document.createElement("UL");
    ul.setAttribute("class", "nested");

    // Insert chidren
    var children = heuristicTree[state];
    for (let i = 0; i < children.length; i++){
        var child = children[i];
        if (child.state == heuristicSol[idx+1]){
            ul.appendChild(heuristicTreeHelper(child.state, idx+1, child));
        }
        else {
            var liChild = document.createElement("LI");
            liChild.innerHTML = `${child.state} (cost: ${child.weight}, score: ${child.score})`
            if (child.vis == true) {
                liChild.setAttribute("class", "ignored");
            }
            ul.appendChild(liChild);
        }
    }
    if (children.length > 0 ) li.appendChild(ul);

    return li;
}

function buildHeuristicTree(){
    var div = document.getElementById("tree");
    var hid = div.getAttribute("hidden");
    if (hid != null) div.removeAttribute("hidden");

    div.innerHTML = '';
    var n = heuristicSol.length;
    
    var treeHead = document.createElement("UL");
    treeHead.setAttribute("id", "tree-head");

    var childNodes = heuristicTreeHelper(heuristicSol[0], 0, null);
    treeHead.appendChild(childNodes);
    div.appendChild(treeHead);

    addTreeListeners();
}


function buildBfsTree(){
    var div = document.getElementById("tree");
    div.setAttribute("hidden","");
}