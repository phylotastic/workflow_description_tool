/**
 * Author : Thanh Nguyen
 * Doc : Service composition framework - Workflow Description Tool
 * Date : 25-Feb-2017
 **/
var GLOBAL_NODES_DATA = [];

var GLOBAL_EDGES_DATA = [];

function clearData(){
  GLOBAL_NODES_DATA = [];
  GLOBAL_EDGES_DATA = [];

}

function initNode(node){
  return {data : {id : node.id, name : node.name, faveShape: node.shape, type:node.type}}
}

function initEdge(edge){
  return {data: { source: edge.source, target: edge.target } }
}

function AddNodeData(){
  var new_node =   { data: { id: 'n4',name:'WebService NEW',faveShape:'triangle' } };
  GLOBAL_NODES_DATA.push(new_node)
  DisplayWorkflow_Graphic();
}

function loadFile() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
      return;
    }

    input = document.getElementById('fileinput');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
    }

    function receivedText(e) {
      lines = e.target.result;
      var newArr = JSON.parse(lines);
      clearData();
      workflow_plan_data = newArr
    }
  }

function setUpInitalState(workflow_plan_data){
  var requestInput = workflow_plan_data.request_parameters.input
  var initialState_Node_Temp = {}
  var id = ""
  var name = "Init State : "
  var type = "initial_state_node"
  for(var i = 0 ; i < requestInput.length ; i++){
    if (i < requestInput.length - 1) {
       id += requestInput[i].ontology_resource_id + "_"
       name += requestInput[i].name + ","
    } else {
       id = requestInput[i].ontology_resource_id
       name += requestInput[i].name
    }
  }
  initialState_Node_Temp.id = id
  initialState_Node_Temp.name = name
  initialState_Node_Temp.type = type
  initialState_Node_Temp.shape = "triangle"
  var initialState_Node = initNode(initialState_Node_Temp)
  return initialState_Node
}

function setUpOneOperationNode(operation){
  var operation_node_temp = {}
  operation_node_temp.id = operation.operation_name
  operation_node_temp.name = operation.operation_name
  operation_node_temp.type = "operation_node"
  operation_node_temp.shape = "ellipse"
  var operation_node = initNode(operation_node_temp)
  return operation_node
}

function setUpAllEdgesForOperationNodes(operation_nodes){
  var operation_nodes_edges = []
  var edge_temp = {}
  for(var i = 0 ; i < operation_nodes.length ; i++){
    if (i < operation_nodes.length - 1){
      edge_temp = {}
      edge_temp.source = operation_nodes[i].data.id
      edge_temp.target = operation_nodes[i+1].data.id
      var edge = initEdge(edge_temp)
      operation_nodes_edges.push(edge)
    }
  }
  return operation_nodes_edges
}

function setUpEdge_FromInit_ToFirstOperation(initNode,operation_nodes){
  var edge_temp = {}
  edge_temp.source = initNode.data.id
  edge_temp.target = operation_nodes[0].data.id
  var edge = initEdge(edge_temp)
  return edge
}

function setUpEdge_FromLastOperation_ToGoal(goalNode,operation_nodes){
  var edge_temp = {}
  edge_temp.source = operation_nodes[operation_nodes.length-1].data.id
  edge_temp.target = goalNode.data.id
  var edge = initEdge(edge_temp)
  return edge
}

function setUpAllOperationNodes(workflow_plan_data){
   var plan = workflow_plan_data.workflow_plan[0].plan
   var operation_nodes = []
   for(var i = 0 ; i < plan.length ; i++){
     var operation_node = setUpOneOperationNode(plan[i])
     operation_nodes.push(operation_node)
   }
   return operation_nodes
}

function setUpGoalState(workflow_plan_data){
  var requestOutput = workflow_plan_data.request_parameters.output
  var goalState_Node_Temp = {}
  var id = ""
  var name = "Goal State : "
  var type = "goal_state_node"
  for(var i = 0 ; i < requestOutput.length ; i++){
    if (i < requestOutput.length - 1) {
       id += requestOutput[i].ontology_resource_id + "_"
       name += requestOutput[i].name + ","
    } else {
       id = requestOutput[i].ontology_resource_id
       name += requestOutput[i].name
    }
  }
  goalState_Node_Temp.id = id
  goalState_Node_Temp.name = name
  goalState_Node_Temp.type = type
  goalState_Node_Temp.shape = "triangle"
  var goalState_Node = initNode(goalState_Node_Temp)
  return goalState_Node

}

function interactiveNode(action,node){
  if (action.trim().toUpperCase() == "TAP"){
    console.log("Taped " + node.id())
  }
}


function DisplayWorkflow_Graphic(){
  /* Init GLOBAL_NODES_DATA object and GLOBAL_EDGES_DATA objects from workflow_plan.json or worflow_plan.js*/
  console.log(workflow_plan_data)
  /* Add node for Input request */
  var initNode = setUpInitalState(workflow_plan_data)
  GLOBAL_NODES_DATA.push(initNode)

  /* Add Goal State */
  var goalNode = setUpGoalState(workflow_plan_data)
  GLOBAL_NODES_DATA.push(goalNode)

  /* Set up action */
  var operation_nodes = setUpAllOperationNodes(workflow_plan_data)
  for(var i = 0 ; i < operation_nodes.length ; i++){
    GLOBAL_NODES_DATA.push(operation_nodes[i])
  }

  /* Set up all edge for operation nodes */
  var operation_nodes_edges = setUpAllEdgesForOperationNodes(operation_nodes)
  for(var i = 0 ; i < operation_nodes_edges.length ; i++){
    GLOBAL_EDGES_DATA.push(operation_nodes_edges[i])
  }

  var first_edge = setUpEdge_FromInit_ToFirstOperation(initNode,operation_nodes)
  GLOBAL_EDGES_DATA.push(first_edge)

  var last_edge = setUpEdge_FromLastOperation_ToGoal(goalNode,operation_nodes)
  GLOBAL_EDGES_DATA.push(last_edge)

  var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    layout: {
      name: 'dagre'
    },
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(name)',
          'shape': 'data(faveShape)',
          'text-opacity': 3,
          'text-valign': 'top',
          'text-halign': 'center',
          'background-color': '#11479e'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'target-arrow-shape': 'triangle',
          'line-color': '#ad1a66',
          'target-arrow-color': '#ad1a66',
          'curve-style': 'bezier'
        }
      }
    ],
    elements: {
      nodes: GLOBAL_NODES_DATA,
      edges: GLOBAL_EDGES_DATA
    },
  });

  cy.on('tap', 'node', function(evt){
      var node = evt.cyTarget;
      interactiveNode('tap',node)
  });
  /* Traditonal Right Click Context Menus */
  cy.contextMenus({
    menuItems: [
           {
              id: 'remove-node-edge',
              title: 'Remove node or edge',
              selector: 'node, edge',
              onClickFunction: function (event) {
                event.cyTarget.remove();
              },
              hasTrailingDivider: true
            },
            {
               id: 'info-node',
               title: 'Info node',
               selector: 'node',
               onClickFunction: function (event) {
                 //event.cyTarget.remove();
                 console.log("Info node")
               },
               hasTrailingDivider: true
            },
            {
               id: 'info-edge',
               title: 'Info edge',
               selector: 'edge',
               onClickFunction: function (event) {
                 //event.cyTarget.remove();
                 console.log("Info edge")
               },
               hasTrailingDivider: true
            },
            {
              id: 'add-node-operation',
              title: 'Add operation node',
              coreAsWell: true,
              onClickFunction: function (event) {
                var nid = prompt("New operation ID", "getPhylogeneticTree_TreeBase_GET");
                if (nid == null) {
                    return;
                }
                var data = {
                    group: 'nodes',
                    id: nid,
                    name:nid,
                    type:'operation_node',
                    faveShape:'ellipse'
                };

                cy.add({
                    data: data,
                    position: {
                        x: event.cyPosition.x,
                        y: event.cyPosition.y
                    }
                });
              }
            },
            {
              id: 'add-edge',
              title: 'Add edge',
              coreAsWell: true,
              onClickFunction: function (event) {
                console.log("add edge")
              }
            }
          ],
          menuItemClasses: ['custom-menu-item'],
          contextMenuClasses: ['custom-context-menu']
        });
}

$(function(){
  console.log("Ready to Go")
});
