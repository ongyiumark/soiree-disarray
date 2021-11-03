// Global Variables
var states = new Array();
var state2idx = new Object();
var partitions = new Object();
var graph = new Object();

var startState = "BBBGGG";
var goalPartition = "BG";

// Heuristic Variables
var currentState = "";
var time = 0;
var heuristicSol = new Array();
var heuristicTimes = new Array();
var heuristicLog = "";
var heuristicIdx = 0;
var vis = new Array();

// BFS Variables
var bfsSol = new Array();
var bfsTimes = new Array();
var bfsLog = "";
var bfsIdx = 0;

// Run onload.
function start(){
    initialize();

    // Display options on the page.
    displayGameSelector();
}

// Apply bfs from 'startState' to 'goalPartition'.
function applyBfs(){
    // Unhides div.
    showDiv("bfs");

    // Resetting variables.
    bfsLog = "";
    bfsSol = new Array();
    bfsTimes = new Array();
    bfsTree = new Object();
    bfsTreePath = new Array();

    var parents = new Object();
    var queue = new Array();

    

    // Pushing starting state to queue.
    addBfsLog(`Enqueing ${startState}...`);
    var idx = 0;
    queue.push({
        state: startState,
        idx: idx
    });
    var lastState = new Object();

    // Starting BFS.
    while(queue.length > 0){
        // Dequeue a state.
        var u = queue[0];
        queue.shift();
        addBfsLog(`Dequeing ${u.state}...`);

        // Checking if the current state is a goal state.
        addBfsLog(`Checking if '${u.state}' satisfies the '${goalPartition}' partition...`);
        if (partitions[goalPartition].includes(u.state)) {
            addBfsLog(`'${u.state}' satisfies the '${goalPartition}' partition!`);
            addBfsLog(`Game Over.`);
            addBfsLog("");
            lastState = u;
            break;
        }
        addBfsLog(`'${u.state}' is not a goal state. Expanding...`);
        
        // Storing children for visualization.  
        bfsTree[u.state+u.idx.toString()] = new Array();

        // Enqueuing child nodes.
        var n = graph[u.state].length;
        for (let i = 0; i < n; i++){
            var v = graph[u.state][i].to;
            addBfsLog(`Enqueing state '${v}'...`);
            idx += 1;
            queue.push({
                state: v,
                idx: idx
            });
            if (i == n-1) addBfsLog("");
            // Mapping state (with its unique queue id) to its parent.
            parents[v+idx.toString()] = u;

            bfsTree[u.state+u.idx.toString()].push({
                state: v,
                idx: idx
            })
        }        
    }

    // Walking back from goal state to recover solution.
    var tmp = lastState;
    while(tmp.state != startState){
        bfsSol.push(tmp.state);
        bfsTreePath.push(tmp.state+tmp.idx.toString());
        var par = parents[tmp.state+tmp.idx.toString()];
        tmp = par;
    }
    bfsSol.push(startState);
    bfsSol.reverse();
    bfsTreePath.reverse();
    
    // Calculating time array.
    var currtime = 0;
    bfsTimes.push(currtime);
    for (let i = 1; i < bfsSol.length; i++){
        var s1 = bfsSol[i-1];
        var s2 = bfsSol[i];

        var move = new Array();
        for (let j = 0; j < 6; j++){
            if (s1.charAt(j) != s2.charAt(j)) move.push(j);
        }

        var w = (move[1]-move[0] == 1 ? 2 : 3);

        currtime += w;
        bfsTimes.push(currtime);
    }

    addBfsLog(`The solution is ${bfsSol.join(", ")}.`);
    addBfsLog(`This took ${currtime} units of time.`);
    displaySolution("bfs");
    buildBfsTree();
}

// Apply heuristic from 'startState' to 'goalPartition'.
function applyHeuristic(){
    // Unhides div.
    showDiv("heuristic");

    // Resetting variables
    currentState = startState;
    for (let i = 0; i < states.length; i++) vis[i] = false;
    time = 0;
    heuristicLog = "";
    heuristicSol = new Array();
    heuristicTimes = new Array();
    heuristicTree = new Object();
    
    // Start heuristic.
    while(true){
        // Push the current state and current time to the solution array.
        heuristicSol.push(currentState);
        heuristicTimes.push(time);
        heuristicTree[currentState] = new Array();

        // Checking if 'currentState' is a goal state.
        addHeuristicLog(`Checking if '${currentState}' satisfies the '${goalPartition}' partition...`);
        if (partitions[goalPartition].includes(currentState)) {
            addHeuristicLog(`'${currentState}' satisfies the '${goalPartition}' partition!`);
            addHeuristicLog(`Game Over.`);
            addHeuristicLog("");
            break;
        }
        addHeuristicLog(`${currentState} is not a goal state.`)
    
        // Marking 'currentState' as visited.
        addHeuristicLog(`Marking '${currentState}' as visited.`);
        addHeuristicLog("");
        vis[state2idx[currentState]] = true;
    
        // Storing all candidate children nodes.
        var children = Array();
        var n = graph[currentState].length;
    
        for (let i = 0; i < n; i++){
            // Getting heuristic score and weight of child node.
            var state = graph[currentState][i].to;
            var score = heuristicScore(state, goalPartition);
            var weight = graph[currentState][i].weight;

            // Saving for visualization
            heuristicTree[currentState].push({
                score: score,
                weight: weight,
                state: state,
                vis: vis[state2idx[state]]
            });
            
            addHeuristicLog(`Considering going to '${state}'...`);
            // Skip state if already visited.
            if (vis[state2idx[state]]) {
                addHeuristicLog(`'${state}' has already been visited. Ignoring...`);
                continue;
            }

            // Push the current child to the children array.
            children.push({
                score: score,
                weight: weight,
                state: state
            });
            addHeuristicLog(`'${state}' has a heuristic score of ${score} with cost ${weight}.`);
        }
    
        // Sort by (score, weight, state)
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
        
        // Updating current state and time.
        var v = children[0];
        currentState = v.state;   
        time += v.weight;
        addHeuristicLog(`Expanding to state '${v.state}' with score ${v.score} and cost ${v.weight}...`);
        addHeuristicLog("");
    }    

    addHeuristicLog(`The solution is ${heuristicSol.join(", ")}.`);
    addHeuristicLog(`This took ${time} units of time.`);
    displaySolution("heuristic");
    buildHeuristicTree();
}

// Generates the states, the partitions, and the graph.
function initialize(){
    // Get all permutations of "BBBGGG".
    states = getPermutations("BBBGGG");
    var n = states.length;

    // Map states to their indexes.
    // state2idx[s] returns the index state 's'.
    for (let i = 0; i < n; i++){
        state2idx[states[i]] = i;
        vis.push(false);
    }
    
    // Fill in partitions.
    // partitions[p] is an array of states that correspond to the 'p' partition.
    for (let i = 0; i < n; i++){
        var p = getPartition(states[i]);
        if (!(p in partitions)) partitions[p] = new Array();
        partitions[p].push(states[i]);
    } 

    // Fill in graph.
    // graph[s] returns an array to (state,weight) pairs that state 's' can go to.
    for (let i = 0; i < n; i++){
        var state = states[i];
        graph[state] = new Array();
        var arr = state.split("");
        for (let a = 0; a < 6; a++){
            for (let b = a+1; b < 6; b++){
                // Only adjacent or 1 seat apart is allowed.
                if (b-a > 2) break;
                if (arr[a] == arr[b]) continue;
                arr.swap(a,b);
                
                var nstate = arr.join('');
                // 2 unit of time for adjacent.
                // 3 units of time for 1 seat apart.
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

// Takes a string 's' and generates all unique permutations.
function getPermutations(s){
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
        var perms = getPermutations(rem);
        perms.sort();
        for (let j = 0; j < perms.length; j++){
            res.push(curr+perms[j]);
        }
    }
    return res;
}

// Takes a state 's' and returns the partition it belongs to.
function getPartition(s){
    var res = s.charAt(0);
    for (let i = 1; i < 6; i++){
        if (s.charAt(i) != s.charAt(i-1)){
            res += s.charAt(i);
        }
    }
    return res;
}

// Takes 2 states, 's1' and 's2', and returns the number of wrong positions.
function wrong(s1, s2){
    var cnt = 0;
    for (let i = 0; i < 6; i++){
        if (s1.charAt(i) != s2.charAt(i)){
            cnt += 1;
        }
    }
    return cnt;
}

// Returns the heuristic score of a 'state' with respect to the 'goal' partition.
function heuristicScore(state, goal){
    var res = 1000;
    for (let i = 0; i < partitions[goal].length; i++){
        res = Math.min(res, wrong(state, partitions[goal][i]));
    }
    return res;
}

// Change current goal partition whenever drop down menu value changes.
function changeGoal(){
    var sel = document.getElementById("partition-select");
    goalPartition = sel.value;
}

// Helper function to swap two elements of an array.
Array.prototype.swap = function(a,b){
    var tmp = this[a];
    this[a] = this[b];
    this[b] = tmp;
}