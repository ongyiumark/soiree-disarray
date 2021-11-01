// Global Variables
var graph = new Object();
var states = new Array();
var partitions = new Object();
var state2idx = new Object();
var vis = new Array();

var started = false;
var start_state = "BBBGGG";
var goal_partition = "BG";

// Heuristic Variables
var current_state = "";
var time = 0;
var heuristic_solution = new Array();
var heuristic_times = new Array();
var heuristic_log = "";
var heuristic_idx = 0;

// BFS Variables
var bfs_solution = new Array();
var bfs_times = new Array();
var bfs_log = "";
var bfs_idx = 0;

var sol = new Array();
var sol_times = new Array();
var sol_idx = 0;
var sol_log = "";

// Helper function to swap two elements of an array.
Array.prototype.swap = function(a,b){
    var tmp = this[a];
    this[a] = this[b];
    this[b] = tmp;
}

function start(){
    if (started) return;

    
    initialize();
    var gameDiv = document.getElementById("game");
    var imgDiv = gameDiv.querySelector(".img-div");
    started = true;

    // Fill partition options
    var sel = document.getElementById("partition_select")
    for (var key in partitions){
        var opt = document.createElement("OPTION");
        opt.setAttribute("value", key)
        opt.innerHTML = key;

        sel.appendChild(opt);
    }
    
    // Generate image tags.
    var images = new Array();
    for (let i = 0; i < 6; i++){
        var s = start_state.charAt(i) == 'B' ? "male" : "female"
        images.push(generate_image(s, i, "img", true));
    }

    for (let i = 0; i < 6; i++){
        imgDiv.appendChild(images[i]);
    }

    gameDiv.appendChild(document.createElement("BR"));

    var hbtn = document.createElement("BUTTON");
    hbtn.innerHTML = "Apply Heuristic";
    hbtn.setAttribute("onClick", "apply_heuristic()");
    gameDiv.appendChild(hbtn);

    var hbtn = document.createElement("BUTTON");
    hbtn.innerHTML = "Apply BFS";
    hbtn.setAttribute("onClick", "apply_bfs()");
    gameDiv.appendChild(hbtn);
}

function apply_bfs(){
    var hdiv = document.getElementById("heuristic");
    var bfsdiv = document.getElementById("bfs");
    hdiv.setAttribute("hidden", "");
    bfsdiv.removeAttribute("hidden");

    bfs_log = "";
    bfs_solution = new Array();
    bfs_times = new Array();

    var parents = new Object();
    var queue = new Array();

    bfs_log += `Enqueing ${start_state}...<br>`;
    var idx = 0;
    queue.push({
        state: start_state,
        idx: idx
    });
    var last_state = new Object();
    while(queue.length > 0){
        var u = queue[0];
        queue.shift();
        bfs_log += `Dequeing ${u.state}...<br>`;

        bfs_log += `Checking if '${u.state}' satisfies the '${goal_partition}' partition...<br>`;
        if (partitions[goal_partition].includes(u.state)) {
            bfs_log += `'${u.state}' satisfies the '${goal_partition}' partition!<br>`;
            bfs_log += `Game Over.<br><br>`;
            last_state = u;
            break;
        }
        bfs_log += `'${u.state}' is not a goal state. Expanding...<br>`;

        var n = graph[u.state].length;
        for (let i = 0; i < n; i++){
            var v = graph[u.state][i].to;
            bfs_log += `Enqueing state '${v}'...<br>`;
            idx += 1;
            queue.push({
                state: v,
                idx: idx
            });
            if (i == n-1) bfs_log += "<br>";
            parents[v+idx.toString()] = u;
        }        
    }

    var tmp = last_state;
    while(tmp.state != start_state){
        bfs_solution.push(tmp.state);
        var par = parents[tmp.state+tmp.idx.toString()];
        tmp = par;
    }
    bfs_solution.push(start_state);
    bfs_solution.reverse();
    
    var currtime = 0;
    bfs_times.push(currtime);
    for (let i = 1; i < bfs_solution.length; i++){
        var s1 = bfs_solution[i-1];
        var s2 = bfs_solution[i];

        var move = new Array();
        for (let j = 0; j < 6; j++){
            if (s1.charAt(j) != s2.charAt(j)) move.push(j);
        }

        var w = (move[1]-move[0] == 1 ? 2 : 3);

        currtime += w;
        bfs_times.push(currtime);
    }

    bfs_log += `The solution is ${bfs_solution.join(", ")}.<br>`;
    bfs_log += `This took ${currtime} units of time.<br>`;
    display_solution("bfs");
}

function apply_heuristic(){
    var hdiv = document.getElementById("heuristic");
    var bfsdiv = document.getElementById("bfs");
    hdiv.removeAttribute("hidden");
    bfsdiv.setAttribute("hidden", "");

    current_state = start_state;
    for (let i = 0; i < states.length; i++) vis[i] = false;
    time = 0;
    heuristic_log = "";
    heuristic_solution = new Array();
    heuristic_times = new Array();
    
    while(true){
        heuristic_solution.push(current_state);
        heuristic_times.push(time);

        heuristic_log += `Checking if '${current_state}' satisfies the '${goal_partition}' partition...<br>`;
        if (partitions[goal_partition].includes(current_state)) {
            heuristic_log += `'${current_state}' satisfies the '${goal_partition}' partition!<br>`;
            heuristic_log += `Game Over.<br><br>`;
            break;
        }
    
        heuristic_log += `Marking '${current_state}' as visited.<br>`;
        vis[state2idx[current_state]] = true;
    
        // Finding the best child node to expand to.
        var children = Array();
        var n = graph[current_state].length;
    
        for (let i = 0; i < n; i++){
            var state = graph[current_state][i].to;
            var score = heuristic_score(state, goal_partition);
            var weight = graph[current_state][i].weight;
            
            heuristic_log += `Considering going to '${state}'...<br>`
            if (vis[state2idx[state]]) {
                heuristic_log += `'${state}' has already been visited. Ignoring...<br>`
                continue;
            }

            children.push({
                score: score,
                weight: weight,
                state: state
            });
            heuristic_log += `'${state}' has a heuristic score of ${score} with cost ${weight}.<br>`;
        }
    
        children.sort((left, right) => {
            if (left.score == right.score && left.weight == right.weight){
                if (left.state < right.state) return -1;
                else if (left.state > right.state) return 1;
                else return 0;
            }
            else if (left.score == right.score) {
                return left.weight - right.weight;
            }
            return left.score-right.score;
        });
    
        var prev_state = current_state;
        var v = children[0];
        current_state = v.state;   
        time += v.weight;
        heuristic_log += `Expanding to state '${v.state}' with score ${v.score} and cost ${v.weight}...<br><br>`;
    }    

    heuristic_log += `The solution is ${heuristic_solution.join(", ")}.<br>`;
    heuristic_log += `This took ${time} units of time.<br>`;
    display_solution("heuristic");
}

function display_solution(sol_type){
    var div = document.getElementById(sol_type);
    var found = false;
    if (sol_type == "heuristic") {
        sol = heuristic_solution;
        sol_idx = heuristic_idx;
        sol_log = heuristic_log;
        sol_times = heuristic_times;
    }
    else {
        sol = bfs_solution;
        sol_idx = bfs_idx;
        sol_log = bfs_log;
        sol_times = bfs_times;
    }

    // Display solution
    var images = new Array();
    for (let i = 0; i < 6; i++){
        var s = sol[0].charAt(i) == 'B' ? "male" : "female"
        
        var oldimg = document.getElementById("img_"+sol_type+i.toString());
        if (oldimg) {
            oldimg.setAttribute("src", "assets/"+s+".png");
            found = true;
        }
        if (!found){
            images.push(generate_image(s, i, "img_"+sol_type, false));
            div.appendChild(images[i]);
        } 
    }
    heuristic_idx = 0;

    // Display Log to Screen.
    var iframe = document.getElementById(sol_type+"_frame");
    if (!iframe){
        iframe = document.createElement("IFRAME");
        iframe.setAttribute("marginwidth", "50");
        iframe.setAttribute("scrolling", "yes");
        iframe.setAttribute("id", sol_type+"_frame");
        div.appendChild(iframe);
    }
    
    iframe.setAttribute("srcdoc", `<p>${sol_log}</p>`)
    div.appendChild(document.createElement("BR"));

    if (!found){
        var nextbtn = document.createElement("BUTTON");
        var prevbtn = document.createElement("BUTTON");
        nextbtn.setAttribute("onclick", "solution_next('"+sol_type+"')");
        prevbtn.setAttribute("onclick", "solution_prev('"+sol_type+"')");
        nextbtn.innerHTML = "Next";
        prevbtn.innerHTML = "Prev";
        div.appendChild(prevbtn); 
        div.appendChild(nextbtn);

        var currtime = document.createElement("P");
        currtime.innerHTML = "Time: 0";
        currtime.setAttribute("id", sol_type+"_sol_time");

        div.appendChild(document.createElement("BR"));
        div.appendChild(currtime);
        div.appendChild(document.createElement("BR"));
    }
    update_display(sol_type);
}

function update_display(sol_type){
    var state = sol[sol_idx];
    for (let i = 0; i < 6; i++){
        var s = state.charAt(i) == 'B' ? "male" : "female";
        var img = document.getElementById("img_"+sol_type+i.toString());
        img.setAttribute("src", "assets/"+s+".png");
    }

    var currtime = document.getElementById(sol_type+"_sol_time");
    currtime.innerHTML = "Time: "+sol_times[sol_idx].toString();
}

function solution_next(sol_type){
    if (sol_idx == sol.length-1) return;
    sol_idx += 1;
    update_display(sol_type);
}

function solution_prev(sol_type){
    if (sol_idx == 0) return;
    sol_idx -= 1;
    update_display(sol_type);
}

// Takes in male/female and generates the appropriate image tag.
function generate_image(s, id, prefix, drag){
    var res = document.createElement("IMG");
    res.setAttribute("src", "assets/"+s+".png");
    res.setAttribute("height", "150");
    res.setAttribute("alt", s);
    res.setAttribute("class", "boygirl");
    res.setAttribute("id", prefix+id.toString());

    // Draggable attributes.
    if (drag){
        res.setAttribute("ondrop", "drop(event)");
        res.setAttribute("ondragover","allow_drop(event)")
        res.setAttribute("draggable", "true");
        res.setAttribute("ondragstart","drag(event)");
    }
    return res;
}

// Generates the states, the partitions, and the graph.
function initialize(){
    // Get all permutations of "BBBGGG".
    states = get_permutations("BBBGGG");
    var n = states.length;

    // Turn raw states into their corresponding 6-bit number
    for (let i = 0; i < n; i++){
        state2idx[states[i]] = i;
        vis.push(false);
    }
    
    // Fill in partitions.
    for (let i = 0; i < n; i++){
        var p = get_partition(states[i]);
        if (!(p in partitions)) partitions[p] = new Array();
        partitions[p].push(states[i]);
    } 

    // Fill in graph.
    for (let i = 0; i < n; i++){
        var state = states[i];
        graph[state] = new Array();
        var arr = state.split("");
        for (let a = 0; a < 6; a++){
            for (let b = a+1; b < 6; b++){
                if (b-a > 2) break;
                if (arr[a] == arr[b]) continue;
                arr.swap(a,b);
                
                var nstate = arr.join('');
                var w = (b-a == 1 ? 2 : 3);

                graph[state].push({
                    to: nstate,
                    weight: w
                });

                arr.swap(a,b);
            }
        }
    }
}    

// Takes a string and generates all unique permutations.
function get_permutations(s){
    var res = Array();
    var n = s.length;
    if (n == 1) {
        res.push(s);
        return res;
    }

    for (let i = 0; i < n; i++){
        var curr = s.charAt(i);
        if (s.indexOf(curr) != i) continue;

        var rem = s.substr(0,i)+s.substr(i+1);
        var perms = get_permutations(rem);
        perms.sort();
        for (let j = 0; j < perms.length; j++){
            res.push(curr+perms[j]);
        }
    }
    return res;
}

// Takes a state and returns the partition it belongs to.
function get_partition(s){
    var res = s.charAt(0);
    for (let i = 1; i < 6; i++){
        if (s.charAt(i) != s.charAt(i-1)){
            res += s.charAt(i);
        }
    }
    return res;
}

// Takes 2 states and returns the number of wrong positions.
function wrong(s1, s2){
    var cnt = 0;
    for (let i = 0; i < 6; i++){
        if (s1.charAt(i) != s2.charAt(i)){
            cnt += 1;
        }
    }
    return cnt;
}

// Returns the heuristic score of a state with respect to the goal.
function heuristic_score(state, goal){
    var res = 1000;
    for (let i = 0; i < partitions[goal].length; i++){
        res = Math.min(res, wrong(state, partitions[goal][i]));
    }
    return res;
}

// Allow drag and drop
function allow_drop(ev){
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    // Swap images
    var img1 = document.getElementById(data);
    var img2 = ev.target;
    var src1 = img1.getAttribute("src");
    var src2 = img2.getAttribute("src");
    img1.setAttribute("src", src2);
    img2.setAttribute("src", src1);

    // Update start state.
    var idx1 = parseInt(img1.getAttribute("id")[3]);
    var idx2 = parseInt(img2.getAttribute("id")[3]);
    var tmp = start_state.split('');
    tmp.swap(idx1,idx2);
    start_state = tmp.join('');
}

// Change current goal partition.
function change_goal(){
    var sel = document.getElementById("partition_select");
    goal_partition = sel.value;
}