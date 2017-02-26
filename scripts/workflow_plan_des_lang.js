var nodes_data = [
  { data: { id: 'n0',name:'WebService 1',faveShape:'triangle'} },
  { data: { id: 'n1',name:'WebService 2',faveShape:'ellipse' } },
  { data: { id: 'n2',name:'WebService 3',faveShape:'ellipse' } },
  { data: { id: 'n3',name:'WebService 4',faveShape:'ellipse' } }
];

var edges_data = [
  { data: { source: 'n0', target: 'n1' } },
  { data: { source: 'n1', target: 'n2' } },
  { data: { source: 'n2', target: 'n3' } }
];

function AddNodeData(){
  var new_node =   { data: { id: 'n4',name:'WebService NEW',faveShape:'triangle' } };
  nodes_data.push(new_node)
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
      console.log(newArr)
    }
  }

function DisplayWorkflow_Graphic(){

  /* Init nodes_data object and edges_data objects from workflow_plan.json or worflow_plan.js*/
  console.log(worflow_plan_data)

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
      nodes: nodes_data,
      edges: edges_data
    },
  });

  /* Traditonal Right Click Context Menus */
  cy.contextMenus({
    menuItems: [
          {
              id: 'remove',
              title: 'remove',
              selector: 'node, edge',
              onClickFunction: function (event) {
                event.cyTarget.remove();
              },
              hasTrailingDivider: true
            },
            {
              id: 'hide',
              title: 'hide',
              selector: '*',
              onClickFunction: function (event) {
                event.cyTarget.hide();
              },
              disabled: false
            },
            {
              id: 'add-node',
              title: 'add node',
              coreAsWell: true,
              onClickFunction: function (event) {
                var data = {
                    group: 'nodes',
                    id: 'n0',
                    name:'WebService 0',
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
              id: 'remove-selected',
              title: 'remove selected',
              coreAsWell: true,
              onClickFunction: function (event) {
                cy.$(':selected').remove();
              }
            },
            {
              id: 'select-all-nodes',
              title: 'select all nodes',
              selector: 'node',
              onClickFunction: function (event) {
                selectAllOfTheSameType(event.cyTarget);
              }
            },
            {
              id: 'select-all-edges',
              title: 'select all edges',
              selector: 'edge',
              onClickFunction: function (event) {
                selectAllOfTheSameType(event.cyTarget);
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
