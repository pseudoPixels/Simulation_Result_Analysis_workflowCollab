//tree implementation starts

//node construct
function Node(data) {
  this.data = data;
  this.parent = null;
  this.isLocked = false;
  this.currentOwner = "NONE";
  this.children = [];
}

//tree construct
function Tree(data) {
  var node = new Node(data);
  this._root = node;
}

//traverse the tree by df default starting from the root of the tree
Tree.prototype.traverseDF = function(callback) {

  // this is a recurse and immediately-invoking function
  (function recurse(currentNode) {
    // step 2
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
      // step 3
      recurse(currentNode.children[i]);
    }

    // step 4
    callback(currentNode);

    // step 1
  })(this._root);

};

//traverse by depth first search from a specified start node (parent)
Tree.prototype.traverseDF_FromNode = function(startNode, callback) {

  // this is a recurse and immediately-invoking function
  (function recurse(currentNode) {
    // step 2
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
      // step 3
      recurse(currentNode.children[i]);
    }

    // step 4
    callback(currentNode);

    // step 1
  })(startNode);

};

//scans through all the nodes of the tree
Tree.prototype.contains = function(callback, traversal) {
  traversal.call(this, callback);

};

//add a new node to a specific parent of the tree
Tree.prototype.add = function(data, toData, traversal) {
  var child = new Node(data),
    parent = null,
    callback = function(node) {
      if (node.data === toData) {
        parent = node;
      }
    };

  this.contains(callback, traversal);

  if (parent) {
    parent.children.push(child);
    child.parent = parent;
  } else {
    throw new Error('Cannot add node to a non-existent parent.');
  }
  //return the newly created node
  return child;
};

//change the parent of a node to a new specified parent. the whole subtree (descendants)
//moves along the node.
Tree.prototype.changeParent = function(data, newParentData, traversal) {
  var targetNode = null,
    oldParent = null,
    callback = function(node) {
      if (node.data === data) {
        oldParent = node.parent;
        targetNode = node;
      }
    };

  this.contains(callback, traversal);

  if (oldParent) {
    index = findIndex(oldParent.children, data);

    if (index === undefined) {
      throw new Error('Node to change parents of does not exist.');
    } else {
      nodeToChangeParentOf = oldParent.children.splice(index, 1);

      var newParent = null,
        newParentCallback = function(node) {
          if (node.data === newParentData) {
            newParent = node;
          }
        };

      this.contains(newParentCallback, traversal);

      if (newParent) {
        newParent.children.push(targetNode);
        targetNode.parent = newParent;
        //alert(newParent.children[0].data);
      } else {
        throw new Error('New Parent Does not exist!');
      }


    }


  } else {
    throw new Error('The node did not have any previous parent!');
  }

};

//removes a particular node from its parent.
Tree.prototype.remove = function(data, fromData, traversal) {
  var tree = this,
    parent = null,
    childToRemove = null,
    index;

  var callback = function(node) {
    if (node.data === fromData) {
      parent = node;
    }
  };

  this.contains(callback, traversal);

  if (parent) {
    index = findIndex(parent.children, data);

    if (index === undefined) {
      throw new Error('Node to remove does not exist.');
    } else {
      childToRemove = parent.children.splice(index, 1);
    }
  } else {
    throw new Error('Parent does not exist.');
  }

  return childToRemove;
};

//returns node object, given its node data
Tree.prototype.getNode = function(nodeData, traversal) {
  var theNode = null,
    callback = function(node) {
      if (node.data === nodeData) {
        theNode = node;
      }
    };
  this.contains(callback, traversal);

  return theNode;

}

//check if the node or any of its descendants are locked currently.
//if not, the node floor is available as per the client request.
Tree.prototype.isNodeFloorAvailable = function(nodeData, traversal) {
  var theNode = this.getNode(nodeData, traversal);
  if (theNode == null) {
    throw new Error('The requested node for access does not exist!');
  }

  //if the node is itself locked, then its NOT available for the requested user
  if (theNode.isLocked == true) return false;

  //if the node itself is not locked, check if any of its children are locked or not
  //if any of them are locked, the access is NOT granted...
  var nodeFloorAvailability = true;
  this.traverseDF_FromNode(theNode, function(node) {
    //if any of its descendants are locked currently, the node access is not available
    if (node.isLocked == true) nodeFloorAvailability = false;
  });


  return nodeFloorAvailability;

}

//someone has got the access to this node, so lock it and all its descendants
Tree.prototype.lockThisNodeAndDescendants = function(newOwner, nodeData, traversal) {
  var theNode = this.getNode(nodeData, traversal);
  this.traverseDF_FromNode(theNode, function(node) {
    //use helper function to load this node for the corresponding user
    lockNode(node, newOwner);
  });
}

//someone has released the access to this node, so UNLOCK it and all its descendants
Tree.prototype.unlockThisNodeAndDescendants = function(nodeData, traversal) {
  var theNode = this.getNode(nodeData, traversal);
  this.traverseDF_FromNode(theNode, function(node) {
    //use the helper function to unlock the node.
    unlockNode(node);
  });
}


//HELPER FUNCTION: child index
function findIndex(arr, data) {
  var index;

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].data === data) {
      index = i;
    }
  }

  return index;
}

//HELPER FUNCTION: lock a given node with corresponding owner name
function lockNode(node, nodeOwner) {
  node.isLocked = true;
  node.currentOwner = nodeOwner;
}

//HELPER FUNCTION: unlock a node
function unlockNode(node) {
  node.isLocked = false;
  node.currentOwner = "NONE";
}

//====================
//tree implementation ends
//====================






//Server Side vars and algorithms
var grantedNodeAccesses = []; //{node,collaborator_id}
var waitingNodeAccessRequests = []; //{node,collaborator_id}

function newNodeAccessRequest(collaboratorID, nodeID) {
  var theNode = workflow.getNode(nodeID, workflow.traverseDF);

  //if the node floor is available currently, then grant the access
  if (workflow.isNodeFloorAvailable(theNode.data, workflow.traverseDF)) {
    var aGrantedNodeAccess = {
      "collaboratorID": collaboratorID,
      "node": theNode.data
    };
    //add the node access granted request to the Q
    grantedNodeAccesses.push(aGrantedNodeAccess);
    //finally lock the node for the corresponding collaborator
    workflow.lockThisNodeAndDescendants(collaboratorID, theNode.data, workflow.traverseDF);
  } else { //some other collaborator has the node access currently, so need to wait
    var anWaitingNodeAccessRequest = {
      "collaboratorID": collaboratorID,
      "node": theNode.data
    };
    waitingNodeAccessRequests.push(anWaitingNodeAccessRequest);
  }

}


function releaseNodeAccess(collaboratorID, nodeID) {
  var theNode = workflow.getNode(nodeID, workflow.traverseDF);

  //release the node, in case its a valid request
  if (isValidNodeReleaseRequest(collaboratorID, theNode.data) == true) {
    //remove from the granted list
    removeFromGrantedRequestList(collaboratorID, theNode.data);
    //unlock the nodes in the workflow tree as well
    workflow.unlockThisNodeAndDescendants(nodeID, workflow.traverseDF);

    //after this node release, check if any waiting request can be served...
    tryServingFromWaitingRequests();

  } else {
    console.log("INVALID NODE ACCESS RELEASE REQUEST!");
  }




}


//helper functions for node release
function isValidNodeReleaseRequest(collaborator, node) {
  var isValid = false;

  for (var i = 0; i < grantedNodeAccesses.length; i++) {
    if (grantedNodeAccesses[i]["collaboratorID"] == collaborator && grantedNodeAccesses[i]["node"] == node) {
      isValid = true;
    }
  }

  return isValid;

}


function removeFromGrantedRequestList(collaborator, node) {
  var tmpGrantedList = [];

  for (var i = 0; i < grantedNodeAccesses.length; i++) {
    if (!(grantedNodeAccesses[i]["collaboratorID"] == collaborator && grantedNodeAccesses[i]["node"] == node)) {
      tmpGrantedList.push(grantedNodeAccesses[i]);
    }
  }

  grantedNodeAccesses = tmpGrantedList;

}




function removeFromWaitingList(collaborator, node) {
  var tmpWaitingList = [];

  for (var i = 0; i < waitingNodeAccessRequests.length; i++) {
    if (!(waitingNodeAccessRequests[i]["collaboratorID"] == collaborator && waitingNodeAccessRequests[i]["node"] == node)) {
      tmpWaitingList.push(waitingNodeAccessRequests[i]);
    }
  }

  waitingNodeAccessRequests = tmpWaitingList;

}







function tryServingFromWaitingRequests() {
  var tmpWaitingList = [];

  for (var i = 0; i < waitingNodeAccessRequests.length; i++) {
    if (workflow.isNodeFloorAvailable(waitingNodeAccessRequests[i]["node"], workflow.traverseDF) == true) {
      //make this node request and it will be granted for sure
      newNodeAccessRequest(waitingNodeAccessRequests[i]["collaboratorID"], waitingNodeAccessRequests[i]["node"]);
      //remove the granted node request from the waiting list
      removeFromWaitingList(waitingNodeAccessRequests[i]["collaboratorID"], waitingNodeAccessRequests[i]["node"]);
    }
  }

}



function isTheNodeInThisList(theList, nodeID){
    var isUserLocked = false;

    for(var i=0; i < theList.length; i++){
        if(theList[i]["node"] == nodeID){
            isUserLocked = true;
        }
    }

    return isUserLocked;
}





//upto 30 collaborators... each 100 instructions
var workflow_instructions = [
['10','addModule','11','updateDatalink','14','updateParam','13','addModule','10','updateDatalink','10','updateParam','11','addModule','12','updateDatalink','14','updateDatalink','13','updateParam','12','updateDatalink','13','updateDatalink','12','updateParam','14','updateParam','14','addModule','11','updateParam','14','addModule','10','updateParam','13','addModule','13','updateDatalink','14','addModule','10','updateDatalink','12','updateDatalink','11','updateDatalink','11','addModule','12','addModule','11','updateParam','11','updateParam','14','addModule','14','addModule','11','updateDatalink','13','updateParam','13','updateDatalink','11','addModule','12','addModule','13','updateParam','14','updateParam','10','updateDatalink','14','addModule','11','addModule','12','updateParam','14','updateParam','10','updateDatalink','13','updateParam','14','updateParam','10','updateDatalink','13','updateParam','14','updateParam','13','updateDatalink','12','updateDatalink','14','updateParam','12','updateDatalink','11','updateParam','10','addModule','11','updateDatalink','10','updateParam','13','addModule','12','addModule','14','updateParam','14','updateParam','14','updateDatalink','14','addModule','11','updateDatalink','12','updateDatalink','12','updateParam','11','addModule','13','updateParam','14','addModule','14','updateDatalink','13','updateDatalink','10','addModule','14','updateDatalink','10','addModule','14','updateParam','12','addModule','12','updateDatalink','11','addModule','13','addModule','12','updateDatalink','13','updateDatalink','11','updateParam','12','addModule','12','updateDatalink','14','updateParam','14','updateDatalink','14','addModule','10','updateDatalink','13','updateDatalink','10','addModule','12','updateParam','11','updateParam','13','updateParam','11','updateParam','10','updateParam','11','addModule','12','addModule','12','addModule','10','updateParam','13','updateDatalink','11','addModule'],
['10','addModule','10','updateDatalink','10','addModule','12','addModule','11','updateParam','10','updateParam','13','addModule','11','updateDatalink','10','addModule','13','addModule','14','updateDatalink','14','updateParam','10','updateDatalink','12','updateDatalink','14','updateParam','10','updateDatalink','10','updateDatalink','12','addModule','10','addModule','11','updateParam','14','addModule','10','addModule','13','addModule','10','addModule','14','updateParam','11','updateParam','13','addModule','10','addModule','12','updateParam','10','addModule','11','updateParam','10','updateParam','11','addModule','13','addModule','11','addModule','10','updateDatalink','10','updateDatalink','10','updateDatalink','12','updateParam','11','updateParam','13','addModule','10','updateParam','11','updateDatalink','14','updateDatalink','14','updateParam','12','updateDatalink','13','updateDatalink','12','addModule','13','addModule','13','updateParam','13','updateDatalink','11','updateParam','14','addModule','14','addModule','11','updateParam','13','addModule','12','addModule','11','updateDatalink','13','updateDatalink','14','updateDatalink','10','addModule','13','updateDatalink','12','updateParam','10','updateDatalink','11','updateParam','12','updateParam','12','updateParam','14','updateParam','13','addModule','10','updateParam','10','updateDatalink','11','updateDatalink','13','updateParam','14','updateDatalink','11','updateDatalink','14','addModule','11','addModule','12','updateDatalink','10','addModule','10','updateParam','10','addModule','10','updateDatalink','12','updateParam','10','addModule','13','updateParam','12','updateParam','13','updateParam','13','updateParam','13','addModule','11','updateParam','12','updateParam','10','updateDatalink','12','updateDatalink','14','updateDatalink','14','addModule','12','updateParam','10','updateDatalink','11','addModule','13','updateParam','10','updateParam'],
['13','updateParam','13','addModule','10','updateDatalink','10','updateDatalink','12','updateParam','14','updateParam','12','addModule','10','updateParam','12','updateParam','10','updateParam','11','updateDatalink','12','addModule','10','addModule','12','updateParam','10','updateParam','10','updateParam','10','updateParam','12','updateParam','12','updateDatalink','12','updateDatalink','12','updateDatalink','12','addModule','13','addModule','13','updateDatalink','10','addModule','11','updateParam','12','addModule','10','updateParam','13','addModule','10','updateDatalink','11','addModule','12','updateDatalink','10','addModule','14','updateParam','10','updateParam','12','updateDatalink','13','addModule','10','updateParam','11','updateParam','12','addModule','11','updateParam','14','updateDatalink','12','updateParam','13','addModule','10','addModule','14','addModule','11','addModule','12','addModule','14','addModule','13','addModule','11','addModule','13','updateParam','11','addModule','12','updateParam','11','addModule','14','updateParam','14','updateDatalink','14','updateParam','10','updateDatalink','11','updateParam','12','addModule','12','updateDatalink','14','addModule','12','updateParam','14','addModule','12','updateDatalink','11','updateDatalink','13','addModule','14','updateParam','11','updateParam','10','updateDatalink','14','updateDatalink','11','addModule','13','addModule','12','updateDatalink','10','updateParam','14','updateParam','12','addModule','12','addModule','14','updateParam','11','updateParam','12','updateDatalink','10','addModule','12','updateParam','10','addModule','14','addModule','13','addModule','10','updateParam','13','updateDatalink','14','updateDatalink','12','addModule','13','updateDatalink','14','addModule','12','updateParam','14','updateDatalink','10','updateParam','10','addModule','12','updateParam','11','updateParam','13','addModule'],
['11','updateParam','14','addModule','13','addModule','14','updateParam','10','updateParam','11','updateDatalink','13','updateParam','10','addModule','14','updateDatalink','11','addModule','14','addModule','11','updateParam','13','updateParam','13','updateParam','11','updateDatalink','11','updateParam','11','updateDatalink','11','updateDatalink','14','updateParam','13','updateParam','11','updateDatalink','13','updateParam','11','addModule','14','updateParam','12','updateDatalink','13','addModule','12','updateParam','11','addModule','12','addModule','13','updateDatalink','12','updateDatalink','10','addModule','12','addModule','11','updateParam','12','addModule','10','addModule','14','addModule','14','updateParam','14','addModule','10','addModule','10','addModule','11','updateParam','12','updateParam','12','updateParam','10','updateParam','14','updateParam','10','updateParam','14','updateDatalink','11','addModule','13','updateDatalink','12','updateDatalink','12','addModule','11','addModule','13','updateParam','14','addModule','11','addModule','10','addModule','10','addModule','11','updateParam','11','updateParam','10','updateParam','10','updateParam','12','updateDatalink','13','updateDatalink','10','updateDatalink','13','updateParam','10','addModule','13','addModule','13','updateDatalink','13','updateDatalink','12','updateDatalink','14','updateDatalink','14','updateDatalink','13','updateDatalink','11','updateParam','11','addModule','12','updateDatalink','13','addModule','12','updateDatalink','11','updateDatalink','10','updateDatalink','12','updateParam','13','addModule','14','updateParam','14','addModule','14','updateParam','12','updateDatalink','12','updateDatalink','13','updateParam','12','addModule','13','updateDatalink','11','updateParam','14','updateParam','12','updateDatalink','13','updateParam','13','updateParam','13','updateDatalink','10','addModule','13','addModule','13','addModule'],
['14','updateParam','11','updateParam','10','updateDatalink','11','updateParam','14','addModule','13','updateDatalink','14','updateDatalink','12','updateParam','12','updateDatalink','14','updateParam','14','updateParam','10','addModule','10','updateDatalink','13','updateParam','13','addModule','10','updateParam','13','addModule','13','updateDatalink','12','addModule','10','updateParam','11','updateDatalink','12','updateDatalink','14','addModule','10','updateDatalink','13','updateParam','14','addModule','11','updateDatalink','12','updateDatalink','11','addModule','12','updateDatalink','11','updateParam','12','updateDatalink','14','updateParam','10','updateParam','11','updateDatalink','11','updateDatalink','12','addModule','10','updateDatalink','14','updateDatalink','11','updateDatalink','14','updateDatalink','14','updateDatalink','13','updateParam','13','addModule','12','updateDatalink','13','updateParam','13','updateParam','14','updateDatalink','12','addModule','11','addModule','12','updateParam','13','updateDatalink','12','updateParam','11','updateParam','11','updateDatalink','10','addModule','12','updateParam','14','addModule','11','addModule','10','addModule','14','addModule','12','updateParam','11','updateParam','12','addModule','12','updateParam','13','updateDatalink','14','addModule','12','updateParam','14','updateDatalink','14','addModule','14','addModule','10','addModule','11','updateParam','12','updateDatalink','12','addModule','12','updateDatalink','12','updateParam','11','updateDatalink','11','updateParam','12','updateDatalink','10','updateParam','14','updateParam','11','addModule','13','updateParam','11','updateParam','12','updateParam','13','addModule','11','updateParam','10','updateDatalink','13','updateDatalink','13','addModule','12','addModule','14','updateDatalink','12','addModule','10','updateParam','13','addModule','10','updateDatalink','11','addModule','10','addModule','13','updateParam'],
['10','updateParam','13','updateDatalink','14','updateDatalink','11','updateParam','12','updateDatalink','10','addModule','11','addModule','14','updateParam','11','updateDatalink','11','updateParam','11','addModule','12','updateDatalink','11','updateDatalink','14','updateDatalink','13','addModule','12','updateParam','12','addModule','14','addModule','10','updateDatalink','14','updateDatalink','13','updateParam','14','addModule','10','addModule','10','updateDatalink','13','addModule','14','addModule','10','updateDatalink','11','updateDatalink','10','updateParam','10','updateDatalink','14','updateDatalink','13','updateDatalink','11','updateParam','10','addModule','14','updateDatalink','10','addModule','14','updateParam','13','addModule','13','updateDatalink','11','addModule','11','addModule','11','updateParam','12','updateDatalink','13','addModule','14','addModule','12','addModule','13','addModule','10','updateDatalink','10','updateDatalink','12','addModule','10','addModule','13','updateParam','14','addModule','13','addModule','14','addModule','14','updateDatalink','12','updateParam','11','updateDatalink','10','updateDatalink','12','updateDatalink','12','updateDatalink','14','updateParam','12','addModule','12','addModule','12','addModule','11','updateDatalink','11','updateParam','13','updateParam','12','updateParam','12','updateParam','10','updateParam','10','updateDatalink','13','updateDatalink','14','updateDatalink','13','updateDatalink','14','updateParam','14','addModule','10','addModule','14','addModule','12','addModule','13','updateParam','14','updateParam','14','updateParam','11','updateDatalink','14','updateParam','13','updateParam','14','updateDatalink','12','addModule','12','addModule','10','addModule','12','addModule','14','addModule','12','updateParam','13','updateParam','14','updateDatalink','12','updateDatalink','14','updateParam','11','addModule','11','updateParam','10','addModule'],
['13','addModule','13','updateDatalink','13','updateDatalink','14','updateDatalink','13','updateDatalink','10','addModule','13','addModule','11','addModule','14','updateDatalink','13','updateParam','11','updateDatalink','14','addModule','12','updateParam','10','updateDatalink','10','addModule','11','updateDatalink','12','updateDatalink','14','updateDatalink','10','updateDatalink','11','updateParam','12','addModule','13','addModule','14','updateDatalink','11','addModule','14','addModule','13','updateParam','10','updateDatalink','13','updateDatalink','13','addModule','11','updateParam','12','updateDatalink','14','updateParam','12','updateParam','11','addModule','14','updateDatalink','14','updateParam','12','updateDatalink','10','addModule','10','updateDatalink','13','addModule','13','updateDatalink','13','addModule','13','addModule','10','updateDatalink','10','updateDatalink','13','addModule','14','updateDatalink','10','updateParam','14','updateParam','11','updateParam','11','addModule','11','addModule','12','updateDatalink','13','updateParam','12','updateDatalink','10','updateParam','14','updateDatalink','12','addModule','12','updateParam','14','addModule','13','addModule','11','updateDatalink','13','updateParam','14','addModule','11','addModule','12','addModule','13','addModule','13','updateDatalink','11','updateParam','10','addModule','14','addModule','11','addModule','10','addModule','11','updateParam','10','addModule','10','addModule','13','addModule','13','updateParam','14','updateDatalink','13','updateParam','12','updateDatalink','12','addModule','13','addModule','14','updateDatalink','12','addModule','10','updateParam','12','updateParam','12','updateDatalink','12','addModule','13','addModule','14','addModule','14','addModule','12','addModule','11','addModule','13','updateDatalink','11','addModule','14','updateParam','12','updateDatalink','12','addModule','12','addModule'],
['13','addModule','12','updateParam','13','addModule','14','updateDatalink','10','updateParam','14','addModule','10','addModule','11','addModule','14','updateParam','14','addModule','11','addModule','10','updateParam','13','addModule','13','updateDatalink','10','updateParam','14','updateParam','12','updateParam','14','updateDatalink','13','updateParam','13','updateDatalink','13','updateDatalink','13','updateDatalink','12','addModule','11','addModule','13','updateDatalink','12','updateDatalink','14','addModule','12','addModule','13','updateParam','10','updateDatalink','11','updateDatalink','14','updateDatalink','11','updateDatalink','11','updateDatalink','11','updateDatalink','11','updateParam','11','addModule','12','updateParam','14','addModule','11','updateDatalink','13','addModule','10','updateParam','14','updateParam','13','updateParam','10','updateDatalink','13','updateDatalink','12','updateParam','10','addModule','13','addModule','11','addModule','10','updateParam','14','updateDatalink','13','updateDatalink','10','updateDatalink','11','addModule','11','updateDatalink','14','addModule','10','updateParam','10','updateParam','14','updateDatalink','10','updateDatalink','10','updateDatalink','11','addModule','10','updateParam','10','updateDatalink','14','updateParam','12','addModule','14','addModule','12','addModule','13','updateDatalink','13','addModule','12','updateParam','13','addModule','10','updateParam','13','updateDatalink','12','updateParam','10','addModule','10','updateParam','14','updateParam','14','updateDatalink','13','updateDatalink','13','updateDatalink','14','updateParam','13','updateDatalink','12','updateDatalink','12','updateParam','12','updateDatalink','11','addModule','14','updateDatalink','14','updateDatalink','13','updateParam','14','updateDatalink','14','addModule','14','updateParam','14','updateParam','14','updateDatalink','13','updateParam','10','updateDatalink','10','addModule','12','addModule'],
['13','updateParam','12','updateDatalink','14','updateDatalink','14','updateParam','10','addModule','14','updateDatalink','11','addModule','11','addModule','14','addModule','10','updateDatalink','11','updateParam','10','addModule','14','updateParam','12','updateDatalink','10','updateDatalink','13','updateDatalink','10','updateDatalink','14','updateDatalink','10','updateDatalink','11','updateDatalink','14','updateParam','10','updateParam','13','addModule','12','updateParam','12','addModule','10','updateParam','11','updateParam','11','updateParam','14','updateParam','12','updateDatalink','10','updateParam','10','updateParam','13','updateParam','11','updateDatalink','10','addModule','11','addModule','13','updateDatalink','10','addModule','13','addModule','13','updateParam','11','updateDatalink','12','updateParam','11','updateParam','11','addModule','14','updateDatalink','12','updateDatalink','12','updateDatalink','13','updateDatalink','14','updateDatalink','12','updateDatalink','11','addModule','10','updateDatalink','10','updateParam','13','addModule','12','updateDatalink','12','updateDatalink','10','updateParam','13','addModule','12','addModule','10','updateParam','11','addModule','14','addModule','13','addModule','12','updateParam','14','addModule','10','updateDatalink','11','updateParam','14','updateDatalink','11','updateDatalink','13','updateParam','10','addModule','11','updateDatalink','12','updateParam','11','updateParam','12','updateDatalink','11','addModule','14','updateParam','13','addModule','12','addModule','13','updateDatalink','11','updateParam','11','updateParam','10','updateDatalink','11','updateParam','12','updateDatalink','14','addModule','14','updateDatalink','14','updateParam','13','updateDatalink','14','updateParam','10','updateParam','10','updateDatalink','13','updateParam','14','addModule','11','updateParam','14','updateDatalink','13','updateDatalink','13','updateDatalink','14','updateDatalink','14','addModule'],
['12','updateParam','11','updateDatalink','10','addModule','13','addModule','14','updateParam','10','updateDatalink','11','updateParam','12','updateDatalink','10','addModule','13','updateDatalink','13','addModule','13','addModule','14','updateParam','11','updateDatalink','12','updateParam','14','updateDatalink','11','addModule','12','updateDatalink','12','addModule','11','updateParam','14','updateDatalink','13','updateParam','13','addModule','12','updateDatalink','10','updateParam','12','addModule','10','addModule','10','addModule','11','addModule','13','updateParam','12','updateDatalink','14','updateDatalink','14','updateDatalink','14','updateDatalink','12','updateDatalink','12','updateDatalink','10','addModule','10','updateParam','10','updateDatalink','10','addModule','10','updateDatalink','10','updateParam','12','updateParam','11','addModule','12','updateDatalink','11','updateParam','14','updateParam','12','updateParam','13','updateParam','10','updateDatalink','14','updateDatalink','14','updateDatalink','11','addModule','11','addModule','11','updateParam','10','addModule','14','addModule','10','addModule','12','addModule','11','updateParam','10','addModule','14','addModule','10','updateParam','11','updateDatalink','12','addModule','10','updateDatalink','13','updateParam','11','updateDatalink','11','updateParam','14','updateParam','12','updateDatalink','10','updateParam','10','updateDatalink','11','updateDatalink','13','updateParam','13','updateDatalink','11','addModule','12','updateDatalink','10','updateDatalink','10','addModule','12','addModule','10','updateParam','14','addModule','11','updateDatalink','12','addModule','13','addModule','11','updateParam','13','updateDatalink','10','addModule','12','addModule','13','addModule','10','updateParam','12','addModule','11','addModule','11','addModule','10','addModule','14','addModule','10','addModule','14','updateDatalink','13','updateParam'],
['10','updateDatalink','13','updateParam','13','updateParam','12','updateDatalink','10','addModule','12','updateParam','12','addModule','13','addModule','11','addModule','10','updateParam','11','updateDatalink','11','updateDatalink','11','updateParam','10','addModule','14','updateParam','12','updateDatalink','11','addModule','12','updateDatalink','12','updateDatalink','12','updateDatalink','11','updateDatalink','10','updateParam','14','updateParam','10','updateDatalink','12','addModule','10','updateParam','11','updateParam','11','updateParam','12','addModule','12','updateDatalink','13','updateParam','11','addModule','14','updateParam','10','addModule','12','addModule','10','updateParam','10','addModule','12','updateParam','13','updateDatalink','10','addModule','12','addModule','13','addModule','12','updateParam','14','addModule','13','updateDatalink','14','updateParam','13','addModule','10','updateDatalink','12','addModule','11','updateDatalink','14','updateDatalink','10','updateParam','11','addModule','10','updateParam','12','addModule','12','updateDatalink','13','updateDatalink','13','addModule','11','updateDatalink','14','updateParam','11','updateParam','10','updateDatalink','12','updateParam','14','addModule','11','addModule','10','updateParam','10','updateDatalink','11','updateDatalink','10','updateParam','12','updateParam','12','addModule','12','addModule','10','updateParam','12','updateParam','14','updateDatalink','14','addModule','11','addModule','14','updateDatalink','10','updateParam','12','updateParam','12','updateParam','12','updateParam','14','addModule','13','updateDatalink','13','updateDatalink','14','updateParam','13','addModule','10','updateDatalink','11','addModule','11','updateDatalink','10','addModule','10','updateParam','11','updateParam','13','updateDatalink','12','updateDatalink','13','updateParam','12','addModule','12','updateDatalink','10','addModule','14','updateParam'],
['14','updateDatalink','10','updateParam','14','updateParam','14','addModule','14','updateParam','12','addModule','11','addModule','14','updateParam','13','addModule','12','addModule','12','updateDatalink','13','updateParam','11','updateDatalink','10','updateDatalink','11','addModule','14','addModule','12','updateDatalink','12','addModule','13','addModule','10','addModule','13','updateParam','11','updateDatalink','12','updateParam','12','updateParam','11','addModule','11','updateDatalink','11','addModule','13','updateDatalink','14','addModule','12','updateParam','13','updateDatalink','12','addModule','13','updateParam','12','updateDatalink','13','updateDatalink','14','updateParam','11','addModule','14','updateDatalink','11','addModule','14','updateDatalink','12','addModule','12','addModule','12','updateDatalink','12','updateParam','11','updateParam','11','updateDatalink','13','updateParam','14','addModule','10','updateParam','10','addModule','14','addModule','10','updateParam','14','addModule','13','updateDatalink','11','updateDatalink','13','addModule','14','addModule','11','updateDatalink','11','updateParam','10','addModule','10','updateParam','12','updateDatalink','14','updateDatalink','13','updateDatalink','12','addModule','12','updateDatalink','11','updateDatalink','14','addModule','10','addModule','11','addModule','12','updateParam','11','addModule','13','addModule','13','addModule','10','updateParam','14','updateParam','12','addModule','11','addModule','10','addModule','12','addModule','13','updateDatalink','13','addModule','13','updateParam','13','updateDatalink','12','updateDatalink','14','updateDatalink','11','addModule','12','updateDatalink','12','updateParam','10','updateDatalink','13','addModule','14','addModule','12','updateParam','13','updateParam','13','updateParam','12','addModule','11','updateDatalink','11','addModule','12','addModule','11','updateParam'],
['11','addModule','10','addModule','12','updateDatalink','11','updateParam','11','updateParam','10','updateDatalink','13','updateParam','11','updateParam','11','updateParam','11','updateParam','14','updateDatalink','13','addModule','13','addModule','14','updateParam','10','updateParam','10','updateParam','13','addModule','11','addModule','12','updateParam','14','updateDatalink','11','updateDatalink','10','updateDatalink','10','addModule','12','updateParam','11','addModule','14','addModule','13','updateParam','11','updateParam','13','updateParam','12','updateParam','12','addModule','10','updateDatalink','11','updateDatalink','10','updateDatalink','13','updateDatalink','12','updateDatalink','11','updateParam','13','addModule','14','updateDatalink','12','updateDatalink','11','updateParam','10','updateParam','14','updateDatalink','10','updateDatalink','14','updateParam','13','addModule','12','addModule','14','addModule','14','updateDatalink','14','updateParam','13','updateParam','14','updateParam','14','addModule','12','updateDatalink','14','addModule','12','addModule','11','updateDatalink','14','addModule','11','addModule','13','updateParam','12','addModule','11','addModule','10','addModule','13','addModule','13','updateDatalink','11','addModule','14','updateDatalink','13','updateDatalink','10','updateDatalink','14','updateDatalink','12','updateParam','10','updateDatalink','12','addModule','11','updateDatalink','14','addModule','10','updateDatalink','10','addModule','11','updateDatalink','11','addModule','13','updateDatalink','11','updateParam','10','updateParam','12','addModule','14','updateDatalink','12','updateParam','13','updateDatalink','11','addModule','12','updateDatalink','13','updateDatalink','14','addModule','10','addModule','12','updateParam','14','updateParam','12','updateDatalink','11','updateParam','11','updateParam','10','updateDatalink','14','addModule','13','updateDatalink','12','addModule'],
['13','addModule','11','updateParam','10','updateDatalink','10','updateDatalink','11','updateParam','13','addModule','13','updateDatalink','10','addModule','10','updateParam','13','addModule','12','addModule','14','updateParam','11','updateDatalink','10','addModule','10','addModule','11','updateDatalink','12','updateParam','13','updateParam','14','updateParam','11','addModule','14','updateParam','12','updateParam','12','updateParam','12','addModule','11','updateParam','10','updateDatalink','11','addModule','14','addModule','10','addModule','13','addModule','12','updateDatalink','11','updateParam','11','updateParam','12','updateParam','11','updateDatalink','12','updateDatalink','13','addModule','12','addModule','13','updateParam','12','updateDatalink','11','addModule','12','addModule','12','addModule','14','updateParam','14','updateParam','11','addModule','14','addModule','13','addModule','12','updateParam','11','updateDatalink','14','updateParam','11','updateParam','12','updateParam','12','addModule','14','updateDatalink','14','addModule','12','updateParam','10','updateParam','11','addModule','10','updateDatalink','14','addModule','13','updateDatalink','10','addModule','10','updateDatalink','14','updateDatalink','10','addModule','14','updateDatalink','14','updateParam','10','updateDatalink','13','updateParam','10','updateDatalink','14','updateParam','10','addModule','13','addModule','13','updateParam','11','updateParam','14','updateDatalink','13','addModule','11','addModule','14','updateParam','12','updateDatalink','12','addModule','10','updateDatalink','10','updateParam','14','addModule','10','updateParam','14','updateParam','14','updateDatalink','13','addModule','11','updateParam','14','addModule','14','updateParam','12','updateParam','11','updateParam','13','updateDatalink','11','updateDatalink','13','addModule','12','addModule','11','addModule','12','updateDatalink'],
['11','updateDatalink','14','addModule','14','addModule','11','addModule','12','addModule','12','updateParam','11','addModule','12','addModule','11','updateParam','14','updateParam','12','addModule','14','updateDatalink','10','updateParam','14','updateParam','11','addModule','11','updateDatalink','11','addModule','14','addModule','14','updateParam','14','addModule','13','addModule','14','updateDatalink','11','addModule','13','addModule','11','updateParam','14','updateDatalink','12','addModule','11','updateDatalink','13','addModule','12','updateParam','11','updateParam','12','addModule','14','addModule','13','addModule','12','updateDatalink','13','addModule','14','updateDatalink','14','addModule','12','updateParam','10','updateParam','12','addModule','14','updateParam','14','updateDatalink','14','updateParam','12','updateDatalink','12','addModule','12','updateParam','13','updateDatalink','12','updateParam','10','addModule','10','addModule','12','updateParam','13','updateDatalink','13','updateDatalink','13','updateParam','11','updateDatalink','13','updateDatalink','14','updateParam','12','updateDatalink','11','addModule','11','updateParam','12','updateParam','13','updateDatalink','12','updateDatalink','13','updateDatalink','12','addModule','11','updateParam','14','updateDatalink','12','addModule','12','updateDatalink','12','updateParam','11','updateParam','13','addModule','10','addModule','10','updateDatalink','14','updateParam','11','updateDatalink','14','updateDatalink','13','updateDatalink','13','addModule','13','updateParam','10','updateParam','12','updateDatalink','12','addModule','12','addModule','12','updateDatalink','14','updateParam','12','addModule','12','updateParam','11','updateParam','13','updateParam','13','addModule','10','updateParam','11','updateDatalink','14','updateDatalink','14','updateParam','11','addModule','12','updateDatalink','10','updateParam','13','updateDatalink'],
['12','updateDatalink','10','addModule','14','updateDatalink','14','addModule','11','updateParam','12','updateDatalink','14','addModule','14','addModule','13','updateParam','10','updateDatalink','12','addModule','10','addModule','11','addModule','11','updateParam','10','updateParam','13','updateDatalink','11','updateDatalink','12','updateDatalink','14','addModule','10','updateParam','10','updateParam','14','addModule','11','addModule','12','updateDatalink','13','addModule','10','addModule','13','updateDatalink','13','addModule','12','updateParam','13','updateParam','12','updateDatalink','12','updateParam','11','addModule','11','updateDatalink','13','addModule','14','updateDatalink','13','addModule','13','updateParam','10','updateParam','14','updateDatalink','10','updateDatalink','13','addModule','11','updateDatalink','10','updateParam','14','addModule','11','addModule','13','addModule','12','updateDatalink','14','updateParam','12','addModule','14','addModule','12','updateParam','10','updateParam','14','updateDatalink','11','addModule','11','updateDatalink','10','addModule','14','updateDatalink','13','updateDatalink','13','updateDatalink','13','updateParam','10','updateParam','11','addModule','13','addModule','14','updateParam','13','addModule','11','updateDatalink','12','addModule','10','addModule','13','updateDatalink','13','updateDatalink','10','updateParam','14','addModule','14','updateParam','11','updateDatalink','13','addModule','14','addModule','10','addModule','11','updateDatalink','13','addModule','12','updateDatalink','12','updateParam','14','updateDatalink','14','addModule','10','updateParam','12','updateParam','10','updateParam','10','updateParam','11','addModule','14','updateParam','12','addModule','14','updateParam','14','addModule','10','updateParam','10','addModule','12','addModule','14','addModule','11','addModule','13','updateParam','13','updateDatalink'],
['12','addModule','10','updateDatalink','12','updateDatalink','11','updateDatalink','12','updateParam','11','updateDatalink','10','addModule','11','addModule','12','addModule','12','addModule','14','addModule','13','updateDatalink','13','updateParam','11','updateParam','14','updateParam','13','updateDatalink','13','addModule','10','addModule','11','addModule','12','updateDatalink','12','addModule','14','addModule','13','addModule','14','addModule','13','addModule','13','updateDatalink','13','addModule','13','addModule','10','addModule','12','addModule','13','updateDatalink','10','updateDatalink','14','addModule','13','updateDatalink','11','updateDatalink','13','addModule','10','updateDatalink','13','addModule','10','updateParam','13','addModule','11','updateDatalink','12','addModule','13','updateDatalink','13','addModule','14','updateParam','10','updateDatalink','13','updateDatalink','13','updateDatalink','11','updateDatalink','11','updateDatalink','11','updateDatalink','13','updateParam','14','addModule','12','addModule','11','updateParam','14','updateDatalink','13','updateParam','11','updateParam','14','addModule','11','updateParam','14','updateDatalink','10','updateDatalink','10','addModule','14','addModule','14','updateDatalink','10','updateDatalink','14','updateParam','12','updateDatalink','11','addModule','14','addModule','12','updateParam','11','updateParam','13','updateParam','13','addModule','10','addModule','14','updateDatalink','14','updateDatalink','13','addModule','13','updateDatalink','13','updateParam','12','addModule','14','updateDatalink','10','updateParam','14','updateDatalink','12','addModule','10','updateParam','12','updateDatalink','11','updateParam','12','updateDatalink','12','updateDatalink','11','updateDatalink','14','updateParam','13','updateParam','14','updateParam','12','updateParam','10','updateDatalink','11','addModule','12','updateParam','10','addModule','11','updateDatalink'],
['11','updateParam','14','addModule','14','updateDatalink','14','updateParam','12','addModule','11','addModule','13','addModule','10','updateDatalink','14','updateDatalink','11','updateParam','13','updateDatalink','12','updateDatalink','14','addModule','14','addModule','14','updateDatalink','11','addModule','12','addModule','11','addModule','11','updateParam','12','addModule','14','updateParam','14','updateParam','13','updateParam','14','updateParam','13','updateParam','12','updateDatalink','13','updateParam','13','addModule','11','updateDatalink','10','addModule','14','updateDatalink','12','updateParam','12','updateParam','11','updateParam','13','addModule','14','updateParam','12','updateDatalink','10','updateDatalink','10','addModule','10','updateDatalink','12','addModule','11','updateDatalink','14','updateDatalink','12','addModule','14','updateParam','10','updateParam','12','updateDatalink','13','addModule','14','updateParam','14','addModule','14','updateParam','13','updateDatalink','12','updateParam','12','updateDatalink','13','updateParam','14','updateDatalink','10','updateDatalink','13','addModule','13','addModule','13','updateDatalink','14','addModule','10','updateParam','10','updateParam','14','addModule','11','updateParam','10','addModule','10','addModule','10','updateDatalink','12','updateParam','14','updateDatalink','11','updateParam','11','addModule','10','updateDatalink','10','updateDatalink','14','updateDatalink','13','addModule','12','addModule','14','updateParam','11','updateParam','13','updateParam','14','updateParam','10','updateDatalink','13','updateDatalink','11','updateParam','11','addModule','12','addModule','14','updateParam','10','updateDatalink','10','addModule','14','addModule','10','updateParam','14','updateParam','14','updateDatalink','14','updateParam','11','updateParam','14','addModule','11','updateDatalink','14','addModule','13','updateParam','14','addModule'],
['13','addModule','13','addModule','10','updateDatalink','13','updateParam','11','updateDatalink','12','addModule','11','addModule','13','updateDatalink','13','addModule','10','updateParam','11','addModule','14','updateParam','13','updateParam','13','updateParam','12','addModule','14','updateParam','12','updateDatalink','13','updateParam','12','updateParam','14','addModule','14','addModule','10','addModule','13','updateDatalink','12','addModule','10','updateDatalink','13','addModule','13','addModule','10','updateDatalink','11','addModule','13','updateParam','14','addModule','10','addModule','14','updateParam','11','updateDatalink','14','updateDatalink','13','addModule','12','updateParam','12','updateParam','13','updateParam','12','updateParam','12','addModule','13','updateParam','12','updateParam','13','addModule','11','updateParam','11','updateDatalink','12','addModule','12','updateDatalink','11','updateDatalink','13','updateDatalink','13','updateDatalink','14','updateDatalink','10','addModule','14','updateParam','11','addModule','11','updateParam','11','addModule','13','addModule','14','addModule','14','updateDatalink','10','updateParam','11','addModule','14','updateDatalink','10','updateParam','11','addModule','12','updateDatalink','10','updateDatalink','10','addModule','12','addModule','14','updateParam','12','updateDatalink','11','updateDatalink','10','updateParam','13','updateParam','10','updateParam','11','updateDatalink','13','addModule','12','addModule','11','updateParam','14','updateDatalink','14','updateParam','10','updateDatalink','12','updateParam','11','updateDatalink','11','updateDatalink','10','updateDatalink','12','addModule','11','addModule','12','updateParam','10','updateParam','13','updateDatalink','10','updateParam','10','updateParam','13','addModule','12','updateParam','12','updateParam','11','addModule','12','addModule','11','updateParam','12','addModule'],
['11','updateDatalink','10','updateParam','11','addModule','12','addModule','12','updateParam','11','updateParam','10','addModule','14','updateDatalink','12','updateParam','12','updateDatalink','11','updateDatalink','14','updateDatalink','11','addModule','13','addModule','11','updateParam','13','addModule','12','updateParam','10','addModule','12','updateDatalink','12','updateDatalink','14','addModule','12','updateParam','10','updateParam','10','updateParam','12','addModule','11','updateDatalink','12','addModule','10','updateDatalink','11','updateParam','13','addModule','14','addModule','13','addModule','14','updateParam','11','addModule','12','updateParam','11','addModule','13','updateDatalink','11','updateParam','12','addModule','10','addModule','10','updateParam','12','addModule','11','updateDatalink','11','updateParam','14','addModule','10','addModule','11','addModule','12','updateDatalink','11','addModule','14','addModule','12','addModule','10','updateParam','10','addModule','14','updateDatalink','10','updateParam','11','addModule','12','updateDatalink','11','addModule','14','updateParam','12','addModule','10','addModule','12','updateParam','11','updateParam','10','addModule','11','updateParam','10','addModule','13','updateParam','13','updateParam','13','addModule','13','updateDatalink','13','updateDatalink','13','updateParam','11','addModule','12','updateParam','10','updateDatalink','10','updateParam','13','updateDatalink','13','addModule','14','updateDatalink','14','updateParam','11','addModule','10','updateDatalink','14','updateParam','13','addModule','10','addModule','12','updateDatalink','14','updateDatalink','12','updateParam','14','addModule','11','updateDatalink','13','updateDatalink','11','updateParam','12','updateParam','12','updateDatalink','10','updateDatalink','12','updateDatalink','12','addModule','10','addModule','12','updateParam','10','updateParam'],
['13','updateParam','13','updateParam','12','addModule','11','updateDatalink','13','updateDatalink','12','addModule','10','addModule','14','addModule','10','updateParam','11','updateParam','13','updateDatalink','12','updateDatalink','12','addModule','12','addModule','14','updateDatalink','12','updateParam','13','addModule','13','updateParam','10','updateParam','10','addModule','14','addModule','11','updateDatalink','12','updateDatalink','14','updateParam','12','addModule','13','addModule','13','updateDatalink','14','addModule','12','updateParam','11','addModule','11','updateDatalink','13','updateParam','13','updateParam','10','updateDatalink','10','updateDatalink','10','updateParam','14','addModule','13','addModule','10','addModule','14','updateDatalink','14','updateDatalink','13','updateParam','13','addModule','13','updateDatalink','12','updateParam','11','updateParam','13','addModule','12','updateDatalink','13','updateParam','13','addModule','10','addModule','12','addModule','13','updateParam','14','updateDatalink','13','updateParam','14','updateDatalink','11','addModule','13','addModule','12','updateParam','11','updateDatalink','10','updateParam','13','updateDatalink','13','updateDatalink','14','updateParam','14','updateParam','14','updateParam','12','updateParam','13','updateParam','12','updateParam','14','addModule','13','updateDatalink','13','updateDatalink','14','addModule','11','updateParam','12','updateParam','14','updateDatalink','10','updateParam','14','updateParam','13','updateParam','12','addModule','13','addModule','13','updateDatalink','13','updateDatalink','12','updateParam','13','updateParam','10','updateParam','13','addModule','11','updateDatalink','11','updateParam','13','addModule','14','updateDatalink','14','updateParam','13','updateDatalink','11','updateDatalink','11','updateDatalink','12','updateParam','10','addModule','12','updateDatalink','10','updateDatalink','14','addModule'],
['10','updateParam','12','updateDatalink','12','addModule','12','updateParam','13','addModule','13','addModule','13','updateDatalink','12','updateDatalink','10','updateParam','13','addModule','10','updateDatalink','13','updateParam','14','updateParam','11','addModule','14','updateParam','12','updateDatalink','12','addModule','13','updateParam','12','updateDatalink','10','addModule','14','updateDatalink','12','updateDatalink','13','addModule','10','updateDatalink','14','addModule','14','updateParam','11','updateDatalink','11','updateParam','12','addModule','12','addModule','12','updateParam','11','addModule','12','addModule','12','addModule','11','updateDatalink','12','updateDatalink','13','updateParam','14','addModule','11','updateDatalink','10','updateDatalink','10','updateParam','11','updateParam','11','updateDatalink','14','updateParam','12','updateDatalink','10','updateDatalink','13','updateParam','11','updateDatalink','11','addModule','12','updateDatalink','10','addModule','12','updateParam','14','updateParam','10','addModule','14','addModule','13','addModule','14','updateParam','13','addModule','13','updateDatalink','10','updateDatalink','14','updateDatalink','10','updateParam','10','updateParam','10','addModule','14','updateParam','14','addModule','13','updateParam','11','addModule','10','addModule','10','updateDatalink','12','updateParam','13','updateParam','14','addModule','11','updateDatalink','12','updateParam','11','addModule','14','updateParam','10','updateParam','12','updateParam','14','updateDatalink','12','updateParam','10','updateParam','13','updateParam','13','updateDatalink','10','addModule','10','updateDatalink','11','addModule','11','updateParam','13','updateDatalink','12','updateParam','12','updateParam','11','addModule','14','updateDatalink','10','addModule','14','updateDatalink','13','addModule','12','updateParam','12','updateDatalink','10','updateParam','10','updateDatalink'],
['11','updateDatalink','10','updateParam','12','updateParam','10','updateParam','11','updateParam','14','updateDatalink','14','addModule','13','updateParam','13','addModule','14','updateParam','12','updateDatalink','11','updateDatalink','12','addModule','14','addModule','12','addModule','13','updateDatalink','12','addModule','12','updateParam','10','addModule','13','updateParam','11','updateParam','10','updateDatalink','14','addModule','14','updateParam','10','updateParam','13','updateParam','10','updateParam','10','updateParam','11','updateDatalink','10','updateDatalink','12','addModule','11','updateParam','14','updateDatalink','12','updateDatalink','14','updateParam','12','updateParam','10','addModule','10','addModule','13','updateParam','10','updateDatalink','13','updateParam','11','updateDatalink','11','addModule','14','updateParam','12','updateDatalink','10','updateDatalink','10','updateDatalink','12','updateParam','10','updateParam','11','addModule','10','addModule','11','updateParam','12','addModule','12','addModule','13','addModule','12','addModule','14','addModule','14','addModule','13','updateParam','14','updateDatalink','12','updateParam','10','updateParam','11','updateParam','12','updateParam','13','updateDatalink','10','updateDatalink','11','updateParam','12','updateDatalink','14','addModule','11','updateParam','12','updateParam','11','addModule','12','addModule','11','addModule','10','updateParam','11','updateDatalink','10','updateParam','14','updateDatalink','14','updateParam','11','updateParam','13','addModule','12','addModule','12','addModule','10','updateDatalink','12','updateDatalink','14','updateParam','14','addModule','10','updateDatalink','14','updateParam','13','addModule','13','updateParam','10','addModule','11','addModule','14','updateParam','11','updateDatalink','12','updateParam','12','updateParam','11','addModule','12','updateParam','11','addModule'],
['11','updateDatalink','13','updateDatalink','11','updateDatalink','13','updateDatalink','11','updateDatalink','10','addModule','11','addModule','14','updateDatalink','13','updateDatalink','14','addModule','10','addModule','11','addModule','12','updateParam','12','updateDatalink','14','updateParam','11','updateParam','11','updateParam','10','updateDatalink','14','updateDatalink','14','updateDatalink','12','updateParam','14','updateParam','11','addModule','12','updateDatalink','12','updateDatalink','11','addModule','10','updateParam','10','addModule','13','updateDatalink','10','updateDatalink','11','updateDatalink','13','updateDatalink','12','updateDatalink','11','updateDatalink','12','updateDatalink','14','updateParam','12','updateDatalink','10','addModule','14','updateDatalink','11','addModule','11','updateDatalink','10','updateParam','12','updateDatalink','11','addModule','10','updateParam','13','updateParam','12','updateParam','10','updateDatalink','13','addModule','14','updateDatalink','11','addModule','11','updateParam','13','updateParam','14','addModule','12','updateParam','13','updateParam','13','addModule','13','updateDatalink','12','addModule','12','updateParam','10','addModule','12','addModule','10','updateParam','12','updateDatalink','14','addModule','11','updateDatalink','11','updateParam','11','updateDatalink','12','updateParam','13','updateParam','14','addModule','10','updateParam','13','addModule','10','updateParam','14','updateDatalink','14','addModule','13','updateParam','12','updateParam','10','addModule','13','updateParam','14','updateDatalink','11','updateDatalink','11','updateDatalink','11','addModule','12','addModule','11','addModule','12','updateParam','13','updateParam','13','updateDatalink','14','addModule','14','updateDatalink','10','updateDatalink','12','updateDatalink','14','updateDatalink','14','addModule','13','updateDatalink','11','addModule','10','addModule','10','updateDatalink','11','updateParam'],
['11','updateParam','13','updateDatalink','14','updateDatalink','14','addModule','14','addModule','10','updateParam','11','updateDatalink','13','updateParam','14','addModule','11','addModule','10','addModule','10','updateDatalink','14','addModule','12','updateDatalink','14','updateDatalink','11','updateDatalink','10','addModule','12','updateDatalink','12','updateParam','10','updateDatalink','12','updateParam','10','updateParam','10','addModule','11','updateParam','12','updateDatalink','11','addModule','11','updateDatalink','11','updateParam','12','updateDatalink','14','addModule','14','updateDatalink','11','addModule','11','updateParam','13','updateDatalink','14','updateDatalink','14','updateParam','12','updateParam','12','addModule','13','updateDatalink','10','addModule','14','updateDatalink','13','updateParam','14','addModule','14','updateDatalink','11','addModule','10','updateDatalink','10','updateParam','13','updateDatalink','11','addModule','11','updateDatalink','10','updateDatalink','13','addModule','12','updateParam','12','addModule','12','addModule','11','addModule','12','addModule','13','addModule','10','updateDatalink','10','updateParam','11','addModule','13','updateParam','12','updateParam','10','updateDatalink','10','addModule','14','updateParam','13','updateDatalink','10','updateParam','14','updateDatalink','12','updateDatalink','13','updateParam','10','updateParam','13','updateDatalink','12','addModule','14','updateParam','13','updateDatalink','13','updateParam','11','updateParam','14','updateParam','11','addModule','11','updateParam','13','updateParam','14','addModule','13','updateParam','14','addModule','14','updateDatalink','11','addModule','12','updateParam','14','addModule','12','updateDatalink','14','updateParam','10','addModule','10','updateParam','14','updateDatalink','12','updateParam','14','updateDatalink','13','addModule','12','addModule','10','updateDatalink','13','updateDatalink'],
['11','addModule','12','updateParam','13','updateParam','14','updateDatalink','10','updateDatalink','13','addModule','13','updateDatalink','10','updateParam','13','updateParam','14','updateDatalink','13','updateParam','12','updateDatalink','11','updateParam','13','updateDatalink','13','addModule','10','updateDatalink','11','updateParam','13','addModule','12','updateDatalink','11','updateParam','12','addModule','13','updateDatalink','12','updateParam','14','updateDatalink','10','addModule','11','updateParam','13','updateDatalink','11','updateParam','12','updateParam','14','addModule','14','updateParam','12','updateDatalink','10','addModule','13','addModule','10','updateParam','12','updateDatalink','14','addModule','12','updateParam','12','updateDatalink','14','updateParam','12','updateDatalink','10','addModule','14','updateDatalink','13','updateParam','14','updateParam','12','updateDatalink','14','addModule','12','addModule','12','addModule','13','updateDatalink','11','updateParam','10','addModule','13','addModule','12','updateDatalink','12','addModule','10','updateParam','13','addModule','13','addModule','10','addModule','13','updateParam','13','updateDatalink','11','addModule','14','addModule','14','addModule','14','addModule','13','updateDatalink','10','addModule','14','updateParam','11','updateDatalink','10','updateParam','10','updateDatalink','13','updateDatalink','13','addModule','12','addModule','14','updateParam','14','addModule','14','updateParam','13','updateDatalink','11','updateParam','11','updateDatalink','14','updateDatalink','14','updateParam','14','updateParam','10','addModule','14','updateParam','14','updateDatalink','13','updateParam','14','updateParam','10','updateParam','14','updateParam','10','updateParam','13','addModule','14','updateDatalink','13','updateParam','11','addModule','12','addModule','14','addModule','12','updateDatalink','11','updateParam','12','updateDatalink'],
['14','addModule','14','updateParam','13','updateParam','11','addModule','14','updateDatalink','10','updateParam','13','updateParam','12','addModule','12','updateDatalink','13','addModule','14','updateDatalink','11','updateDatalink','11','updateParam','13','updateParam','11','updateParam','14','updateParam','13','updateParam','10','updateDatalink','14','updateDatalink','13','addModule','12','addModule','10','addModule','14','addModule','12','updateParam','14','updateParam','14','addModule','12','updateDatalink','12','addModule','11','updateParam','13','addModule','14','addModule','10','updateParam','10','addModule','13','addModule','14','updateDatalink','14','addModule','12','addModule','10','addModule','11','updateParam','13','addModule','12','updateParam','12','updateParam','10','updateDatalink','11','updateDatalink','11','addModule','14','addModule','14','addModule','12','updateDatalink','13','updateDatalink','11','updateDatalink','13','addModule','10','updateDatalink','14','updateDatalink','13','updateParam','14','updateDatalink','10','updateDatalink','13','updateDatalink','12','updateDatalink','13','addModule','10','addModule','13','addModule','12','updateParam','13','addModule','10','updateParam','12','updateDatalink','11','updateParam','10','updateParam','14','addModule','14','updateParam','11','updateDatalink','13','updateParam','12','updateDatalink','12','updateDatalink','14','updateDatalink','14','updateDatalink','10','updateParam','11','addModule','13','addModule','13','updateDatalink','13','updateDatalink','10','addModule','12','updateDatalink','13','updateDatalink','12','addModule','10','updateParam','13','updateDatalink','10','updateDatalink','11','addModule','14','addModule','12','updateParam','11','updateDatalink','11','updateParam','12','updateDatalink','10','updateParam','13','updateDatalink','11','addModule','10','addModule','12','addModule','14','addModule','11','updateDatalink'],
['14','addModule','12','updateDatalink','10','updateParam','12','addModule','13','updateDatalink','14','addModule','10','updateParam','12','updateParam','11','updateDatalink','10','addModule','14','updateParam','12','addModule','14','addModule','14','updateParam','14','updateDatalink','10','addModule','13','updateDatalink','11','updateParam','10','updateParam','11','updateDatalink','12','updateDatalink','12','addModule','12','updateDatalink','14','addModule','14','updateDatalink','10','addModule','12','updateParam','10','updateParam','13','updateParam','12','updateParam','13','updateParam','11','addModule','13','addModule','14','addModule','10','updateParam','13','addModule','10','updateParam','13','updateParam','11','updateDatalink','11','updateParam','13','addModule','11','addModule','12','updateParam','11','addModule','11','updateDatalink','14','updateParam','13','updateDatalink','11','addModule','12','updateDatalink','10','updateDatalink','10','updateDatalink','14','addModule','10','addModule','10','addModule','14','updateParam','10','addModule','11','updateDatalink','13','updateDatalink','12','addModule','11','addModule','11','updateDatalink','13','addModule','14','updateParam','10','addModule','14','updateParam','11','addModule','10','addModule','11','updateParam','14','updateParam','11','addModule','10','addModule','11','addModule','10','updateParam','11','updateDatalink','13','addModule','12','updateDatalink','13','addModule','10','updateParam','10','updateDatalink','14','updateDatalink','11','updateParam','12','updateDatalink','11','updateDatalink','10','updateDatalink','12','addModule','12','addModule','13','updateDatalink','14','updateParam','10','updateDatalink','14','updateDatalink','10','updateParam','11','updateDatalink','10','addModule','12','updateDatalink','14','updateParam','13','updateDatalink','14','updateDatalink','13','addModule','14','updateDatalink','13','updateParam'],
['14','addModule','12','updateDatalink','14','addModule','11','updateParam','10','updateDatalink','10','updateParam','14','addModule','12','addModule','14','updateParam','10','updateDatalink','12','updateParam','14','addModule','13','updateDatalink','12','updateParam','14','addModule','10','addModule','13','updateDatalink','14','addModule','11','updateParam','13','updateParam','13','updateDatalink','12','updateDatalink','12','addModule','14','addModule','13','addModule','12','updateDatalink','11','updateParam','12','addModule','12','updateParam','14','updateDatalink','14','addModule','14','updateDatalink','13','addModule','12','updateParam','12','addModule','10','updateDatalink','12','updateParam','13','updateDatalink','14','updateParam','13','updateParam','12','updateDatalink','13','updateDatalink','14','addModule','14','addModule','13','updateDatalink','14','updateDatalink','11','updateDatalink','12','updateDatalink','12','addModule','12','addModule','14','addModule','14','addModule','12','updateParam','12','updateDatalink','11','addModule','12','addModule','10','updateDatalink','13','updateDatalink','11','updateParam','11','updateParam','14','addModule','10','updateParam','13','addModule','11','addModule','12','updateDatalink','11','updateDatalink','11','addModule','12','addModule','13','addModule','12','addModule','10','updateParam','11','updateParam','11','addModule','11','updateParam','14','updateParam','11','updateDatalink','13','updateParam','14','updateParam','13','addModule','13','addModule','12','updateDatalink','14','updateParam','14','addModule','10','addModule','13','updateParam','13','updateParam','13','updateParam','10','addModule','12','updateDatalink','13','updateParam','14','updateParam','14','updateDatalink','13','updateParam','10','updateParam','12','addModule','10','addModule','10','addModule','13','addModule','11','updateDatalink','10','addModule'],
['12','addModule','11','addModule','12','updateParam','14','updateDatalink','14','updateDatalink','14','updateDatalink','11','addModule','13','updateParam','14','updateParam','14','updateDatalink','12','updateDatalink','11','updateDatalink','13','addModule','10','updateDatalink','13','updateParam','14','addModule','14','addModule','13','updateDatalink','12','addModule','12','updateParam','12','updateParam','14','updateDatalink','10','updateParam','13','updateDatalink','11','updateDatalink','14','updateDatalink','11','updateParam','12','updateParam','11','addModule','10','addModule','12','addModule','14','updateDatalink','11','addModule','11','addModule','11','addModule','12','addModule','14','updateDatalink','13','addModule','13','updateDatalink','10','addModule','12','addModule','14','addModule','13','updateParam','12','updateParam','13','addModule','11','updateDatalink','13','updateParam','13','addModule','11','addModule','11','updateDatalink','13','updateDatalink','11','updateParam','10','updateParam','13','updateDatalink','12','updateParam','13','addModule','11','updateParam','11','updateDatalink','11','updateParam','14','updateDatalink','10','updateDatalink','14','addModule','14','updateDatalink','13','addModule','14','updateDatalink','12','updateDatalink','14','updateParam','13','updateDatalink','10','updateDatalink','13','updateDatalink','13','updateParam','11','addModule','14','updateDatalink','10','updateDatalink','10','updateParam','10','updateParam','12','updateParam','13','addModule','14','updateDatalink','11','addModule','11','addModule','13','addModule','10','updateDatalink','11','updateParam','11','updateDatalink','10','updateDatalink','12','addModule','11','addModule','10','addModule','13','updateParam','10','addModule','10','updateParam','12','updateParam','14','updateDatalink','14','addModule','11','updateParam','14','updateDatalink','10','addModule','14','addModule','13','addModule']];


  var INSTRUCTIONS_PER_COLLABORATOR = 25;








  //Collaborator Threads
var numOfDoneCollabs = 0;
var nextNumOfCollab = 1;








//Workflow Construction
 //Workflow Construction//2 Regular Tree ***************************
//Workflow Construction
var workflow = new Tree('n1');


workflow.add('n2', 'n1', workflow.traverseDF);
workflow.add('n3', 'n1', workflow.traverseDF);

workflow.add('n4', 'n2', workflow.traverseDF);
workflow.add('n5', 'n2', workflow.traverseDF);

workflow.add('n6', 'n3', workflow.traverseDF);
workflow.add('n7', 'n3', workflow.traverseDF);

workflow.add('n8', 'n4', workflow.traverseDF);
workflow.add('n9', 'n4', workflow.traverseDF);

workflow.add('n10', 'n5', workflow.traverseDF);
workflow.add('n11', 'n5', workflow.traverseDF);

workflow.add('n12', 'n6', workflow.traverseDF);
workflow.add('n13', 'n6', workflow.traverseDF);

workflow.add('n14', 'n7', workflow.traverseDF);
workflow.add('n15', 'n7', workflow.traverseDF);

workflow.add('n16', 'n8', workflow.traverseDF);
workflow.add('n17', 'n8', workflow.traverseDF);

workflow.add('n18', 'n9', workflow.traverseDF);
workflow.add('n19', 'n9', workflow.traverseDF);

workflow.add('n20', 'n10', workflow.traverseDF);
workflow.add('n21', 'n10', workflow.traverseDF);

workflow.add('n22', 'n11', workflow.traverseDF);
workflow.add('n23', 'n11', workflow.traverseDF);

workflow.add('n24', 'n12', workflow.traverseDF);
workflow.add('n25', 'n12', workflow.traverseDF);


var NUM_OF_MODULES = 25;







//============
//Class Definition
//============
function WorkflowCollaborator(collaboratorID, nextInstructionSerial) {
  this.collaboratorID = collaboratorID;
  this.nextInstructionSerial = nextInstructionSerial;
  this.isAccessRequestedAlready = false;
}


//helper function for checking the total number of node access available to this collaborator
WorkflowCollaborator.prototype.getCountsOfMyAccessNode = function(){
    var nodeCount = 0;
    for(var i=0; i<grantedNodeAccesses.length; i++){
        if(grantedNodeAccesses[i]["collaboratorID"] == this.collaboratorID)nodeCount++;
    }

    return nodeCount;
};



WorkflowCollaborator.prototype.removeAllMyAccessedNodes = function(){
    for(var i=0; i<grantedNodeAccesses.length; i++){
        //I had the access to this node
        if(grantedNodeAccesses[i]["collaboratorID"] == this.collaboratorID){
            //release access to this node and its descendants
            releaseNodeAccess(this.collaboratorID, grantedNodeAccesses[i]["node"]);
        }
    }

    //print_list(grantedNodeAccesses, "NEW GRANT LIST");
};


WorkflowCollaborator.prototype.getAllMyAccessedNodes = function(){
    var myNodes = "";
    for(var i=0; i<grantedNodeAccesses.length; i++){
        //I had the access to this node
        if(grantedNodeAccesses[i]["collaboratorID"] == this.collaboratorID){
        //add this node to the list
        myNodes += grantedNodeAccesses[i]["node"];

        }
    }

    return myNodes;

};



//returns the node with higher Dependency degree that has not been user locked yet
WorkflowCollaborator.prototype.getNodeWithHigherDependencyDegree_exceptUserLockedNode = function(){
    var theNode = "n1";//by default the root node, as it has the most dependency degree

    for(var i=1;i<=NUM_OF_MODULES;i++){
        if(isTheNodeInThisList(grantedNodeAccesses,"n"+i.toString()) == false){
            theNode = "n"+i.toString();
            break;
        }
    }

    return theNode;

};

//returns the node with the higher dependency degree which has not been user locked or requested (waiting)
//by any other collaborators
WorkflowCollaborator.prototype.getNodeWithHigherDependencyDegree_exceptUserLockedAndWaitingNodes = function(){
    var combinedList = grantedNodeAccesses.concat(waitingNodeAccessRequests);

    var theNode = "n1";//by default the root node, as it has the most dependency degree in case all node has been taken

    //iterate from higher to lower dependency degree
    for(var i=1; i<=NUM_OF_MODULES; i++){
        if(isTheNodeInThisList(combinedList, "n"+i.toString()) == false){
            theNode = "n"+i.toString();
            break;
        }
    }

    return theNode;

};



//returns the node with lower Dependency degree that has not been user locked yet
WorkflowCollaborator.prototype.getNodeWithLowerDependencyDegree_exceptUserLockedNode = function(){
    var theNode = "n" + NUM_OF_MODULES.toString();//by default a leaf node, as it has the least dependency degree

    for(var i=NUM_OF_MODULES;i>=1;i--){
        if(isTheNodeInThisList(grantedNodeAccesses,"n"+i.toString()) == false){
            theNode = "n"+i.toString();
            break;
        }
    }

    return theNode;

};



//returns the node with the lower dependency degree which has not been user locked or requested (waiting)
//by any other collaborators
WorkflowCollaborator.prototype.getNodeWithLowerDependencyDegree_exceptUserLockedAndWaitingNodes = function(){
    var combinedList = grantedNodeAccesses.concat(waitingNodeAccessRequests);

    var theNode = "n"+NUM_OF_MODULES.toString();//by default a leaf node, as it has the least dependency degree in case all node has been taken

    //iterate from lower to higher dependency degree
    for(var i=NUM_OF_MODULES;i>=1;i--){
        if(isTheNodeInThisList(combinedList, "n"+i.toString()) == false){
            theNode = "n"+i.toString();
            break;
        }
    }

    return theNode;

};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}



WorkflowCollaborator.prototype.simulate = function() {
    //do I have any instruction left to exec.
    if(this.nextInstructionSerial <= INSTRUCTIONS_PER_COLLABORATOR){
        //I have access to at least one sub-workflow
        if(this.getCountsOfMyAccessNode()>0){
            //console.log("Node Counts : " + this.getCountsOfMyAccessNode() + " (Nodes: " + this.getAllMyAccessedNodes()+" )");
            if(this.nextInstructionSerial%2 == 0){//this phase is my thinking time
                var thinkingTime = workflow_instructions[this.collaboratorID][this.nextInstructionSerial];

                if(thinkingTime >= 10){//if thinking time is too much, release floor for others
                    this.nextInstructionSerial++;
                    console.log("NODEACCESSRELEASED" + "_" + this.collaboratorID);
                    this.isAccessRequestedAlready = false;
                    this.removeAllMyAccessedNodes();
                    var me = this;
                    setTimeout(function() {
                      me.simulate();
                    }, 4);

                }else{//thinking time is short, wont release the floor
                    this.nextInstructionSerial++;
                    console.log("THINKING" + "_" + this.collaboratorID);
                    var me = this;
                    setTimeout(function() {
                      me.simulate();
                    }, thinkingTime);
                }

            }else{//this phase is update time
                  console.log("UPDATE" + "_" + this.collaboratorID );
                  this.nextInstructionSerial++; //lets try to move for next instruction
                  var me = this;
                  setTimeout(function() {
                    me.simulate();
                  }, 4);
            }


        }else{//I dont have any access, so request for it
            if(this.isAccessRequestedAlready == false){//not requested yet..?, request access
                this.isAccessRequestedAlready = true;
                console.log("NODEACCESSREQUESTED"+ "_" + this.collaboratorID);

                //=====================
                //Different protocols for node access request for the simulation
                //uncomment as per the requirement
                //=====================
                //newNodeAccessRequest(this.collaboratorID, "n1");//always requesting n1 (should behave as floor request), for testing
                //newNodeAccessRequest(this.collaboratorID, this.getNodeWithHigherDependencyDegree_exceptUserLockedNode());//worst case, request always higher dependency degree
                //newNodeAccessRequest(this.collaboratorID, this.getNodeWithHigherDependencyDegree_exceptUserLockedAndWaitingNodes());
                //newNodeAccessRequest(this.collaboratorID, this.getNodeWithLowerDependencyDegree_exceptUserLockedNode());
                //newNodeAccessRequest(this.collaboratorID, this.getNodeWithLowerDependencyDegree_exceptUserLockedAndWaitingNodes());
newNodeAccessRequest(this.collaboratorID, "n"+getRandomInt(1, 26));

                var me = this;
                setTimeout(function() {
                    me.simulate();
                }, 4);

            }else{//already requested node access
                console.log("WAITING"+ "_" + this.collaboratorID);
                //keep checking if I have got the floor
                var me = this;
                setTimeout(function() {
                    me.simulate();
                }, 4);
            }

        }

    }else{//done with executing all the instructions
        console.log("END"+ "_" + this.collaboratorID);
        this.removeAllMyAccessedNodes();


        numOfDoneCollabs++;

        if(numOfDoneCollabs == nextNumOfCollab-1){
            numOfDoneCollabs = 0;

            if(nextNumOfCollab >19){
                alert("Done : " + nextNumOfCollab);
            }else{
                run_simulation_steps(nextNumOfCollab);
                nextNumOfCollab++;
            }

      }


    }


};









console.log("Tasks: 25; Collaborators: 1    =========================>");
var c0 = new WorkflowCollaborator(0, 0);
c0.simulate();
nextNumOfCollab++;
//run_simulation_steps(3);

function run_simulation_steps(nCollabs){
    if(nCollabs==1){
       console.log("Tasks: 25; Collaborators: 1    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       c0.simulate();
    }
    if(nCollabs==2){
       console.log("Tasks: 25; Collaborators: 2    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       c0.simulate();
       c1.simulate();
    }
    if(nCollabs==3){
       console.log("Tasks: 25; Collaborators: 3    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
    }
    if(nCollabs==4){
       console.log("Tasks: 25; Collaborators: 4    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
    }
    if(nCollabs==5){
       console.log("Tasks: 25; Collaborators: 5    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
    }
    if(nCollabs==6){
       console.log("Tasks: 25; Collaborators: 6    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
    }
    if(nCollabs==7){
       console.log("Tasks: 25; Collaborators: 7    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
    }
    if(nCollabs==8){
       console.log("Tasks: 25; Collaborators: 8    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
    }
    if(nCollabs==9){
       console.log("Tasks: 25; Collaborators: 9    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
    }
    if(nCollabs==10){
       console.log("Tasks: 25; Collaborators: 10    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
    }
    if(nCollabs==11){
       console.log("Tasks: 25; Collaborators: 11    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
    }
    if(nCollabs==12){
       console.log("Tasks: 25; Collaborators: 12    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
    }
    if(nCollabs==13){
       console.log("Tasks: 25; Collaborators: 13    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
    }
    if(nCollabs==14){
       console.log("Tasks: 25; Collaborators: 14    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
    }
    if(nCollabs==15){
       console.log("Tasks: 25; Collaborators: 15    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
    }
    if(nCollabs==16){
       console.log("Tasks: 25; Collaborators: 16    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
    }
    if(nCollabs==17){
       console.log("Tasks: 25; Collaborators: 17    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
    }
    if(nCollabs==18){
       console.log("Tasks: 25; Collaborators: 18    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
    }
    if(nCollabs==19){
       console.log("Tasks: 25; Collaborators: 19    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
    }
    if(nCollabs==20){
       console.log("Tasks: 25; Collaborators: 20    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
    }
    if(nCollabs==21){
       console.log("Tasks: 25; Collaborators: 21    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
    }
    if(nCollabs==22){
       console.log("Tasks: 25; Collaborators: 22    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
    }
    if(nCollabs==23){
       console.log("Tasks: 25; Collaborators: 23    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
    }
    if(nCollabs==24){
       console.log("Tasks: 25; Collaborators: 24    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
    }
    if(nCollabs==25){
       console.log("Tasks: 25; Collaborators: 25    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
    }
    if(nCollabs==26){
       console.log("Tasks: 25; Collaborators: 26    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       var c25 = new WorkflowCollaborator(25, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
       c25.simulate();
    }
    if(nCollabs==27){
       console.log("Tasks: 25; Collaborators: 27    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       var c25 = new WorkflowCollaborator(25, 0);
       var c26 = new WorkflowCollaborator(26, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
       c25.simulate();
       c26.simulate();
    }
    if(nCollabs==28){
       console.log("Tasks: 25; Collaborators: 28    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       var c25 = new WorkflowCollaborator(25, 0);
       var c26 = new WorkflowCollaborator(26, 0);
       var c27 = new WorkflowCollaborator(27, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
       c25.simulate();
       c26.simulate();
       c27.simulate();
    }
    if(nCollabs==29){
       console.log("Tasks: 25; Collaborators: 29    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       var c25 = new WorkflowCollaborator(25, 0);
       var c26 = new WorkflowCollaborator(26, 0);
       var c27 = new WorkflowCollaborator(27, 0);
       var c28 = new WorkflowCollaborator(28, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
       c25.simulate();
       c26.simulate();
       c27.simulate();
       c28.simulate();
    }
    if(nCollabs==30){
       console.log("Tasks: 25; Collaborators: 30    =========================>");
       var c0 = new WorkflowCollaborator(0, 0);
       var c1 = new WorkflowCollaborator(1, 0);
       var c2 = new WorkflowCollaborator(2, 0);
       var c3 = new WorkflowCollaborator(3, 0);
       var c4 = new WorkflowCollaborator(4, 0);
       var c5 = new WorkflowCollaborator(5, 0);
       var c6 = new WorkflowCollaborator(6, 0);
       var c7 = new WorkflowCollaborator(7, 0);
       var c8 = new WorkflowCollaborator(8, 0);
       var c9 = new WorkflowCollaborator(9, 0);
       var c10 = new WorkflowCollaborator(10, 0);
       var c11 = new WorkflowCollaborator(11, 0);
       var c12 = new WorkflowCollaborator(12, 0);
       var c13 = new WorkflowCollaborator(13, 0);
       var c14 = new WorkflowCollaborator(14, 0);
       var c15 = new WorkflowCollaborator(15, 0);
       var c16 = new WorkflowCollaborator(16, 0);
       var c17 = new WorkflowCollaborator(17, 0);
       var c18 = new WorkflowCollaborator(18, 0);
       var c19 = new WorkflowCollaborator(19, 0);
       var c20 = new WorkflowCollaborator(20, 0);
       var c21 = new WorkflowCollaborator(21, 0);
       var c22 = new WorkflowCollaborator(22, 0);
       var c23 = new WorkflowCollaborator(23, 0);
       var c24 = new WorkflowCollaborator(24, 0);
       var c25 = new WorkflowCollaborator(25, 0);
       var c26 = new WorkflowCollaborator(26, 0);
       var c27 = new WorkflowCollaborator(27, 0);
       var c28 = new WorkflowCollaborator(28, 0);
       var c29 = new WorkflowCollaborator(29, 0);
       c0.simulate();
       c1.simulate();
       c2.simulate();
       c3.simulate();
       c4.simulate();
       c5.simulate();
       c6.simulate();
       c7.simulate();
       c8.simulate();
       c9.simulate();
       c10.simulate();
       c11.simulate();
       c12.simulate();
       c13.simulate();
       c14.simulate();
       c15.simulate();
       c16.simulate();
       c17.simulate();
       c18.simulate();
       c19.simulate();
       c20.simulate();
       c21.simulate();
       c22.simulate();
       c23.simulate();
       c24.simulate();
       c25.simulate();
       c26.simulate();
       c27.simulate();
       c28.simulate();
       c29.simulate();
    }

}













//Testing

function print_list(theList, listName) {
  console.log("PRINTING : " + listName + " ====> ");

  for (var i = 0; i < theList.length; i++) {
    console.log("collab: " + theList[i]["collaboratorID"] + " node:" + theList[i]["node"]);
  }
}



//collaborators
/*var c0 = new WorkflowCollaborator(0,0);
var c1 = new WorkflowCollaborator(1,0);
var c2 = new WorkflowCollaborator(2,0);
var c3 = new WorkflowCollaborator(3,0);
var c4 = new WorkflowCollaborator(4,0);

c0.simulate();
c1.simulate();
c2.simulate();
c3.simulate();
c4.simulate();*/



/*
print_list(grantedNodeAccesses, "Granted List");
print_list(waitingNodeAccessRequests, "Waiting List");


newNodeAccessRequest("c1", "n1");
newNodeAccessRequest("c2", "n2");


print_list(grantedNodeAccesses, "Granted List");
print_list(waitingNodeAccessRequests, "Waiting List");

newNodeAccessRequest("c3", "n3");

print_list(grantedNodeAccesses, "Granted List");
print_list(waitingNodeAccessRequests, "Waiting List");

releaseNodeAccess("c1", "n1");

print_list(grantedNodeAccesses, "Granted List");
print_list(waitingNodeAccessRequests, "Waiting List");
*/




















