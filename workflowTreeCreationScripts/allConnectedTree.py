import math


ALL_CONNECTIVITY_NUM = 3 #i.e. 2/3/4... all connected tree
MAX_LEVEL_OF_TREE = 50



def getLevelOfNodeIndex(nodeIndex):
    nodeSum = 0
    for aPower in range(0, MAX_LEVEL_OF_TREE+1):
        nodeSum += ALL_CONNECTIVITY_NUM**aPower
        if nodeSum>=nodeIndex:
            return aPower




def getNumOfNodesInLevel(nodeLevel):
    return ALL_CONNECTIVITY_NUM ** nodeLevel




def getNodeLimitsForLevel(nodeLevel):
    start_index  = 1
    for aLevel in range(0, nodeLevel):
        start_index += getNumOfNodesInLevel(aLevel)

    end_index = start_index + getNumOfNodesInLevel(nodeLevel)

    return start_index, end_index





def constructTree(num_of_nodes):
    print("var workflow = new Tree('n1');")
    for aNode in range(2, num_of_nodes+1):
        nodeLevel = getLevelOfNodeIndex(aNode)
        start_index, end_index = getNodeLimitsForLevel(nodeLevel-1)
        for aParentNode in range(start_index,end_index):
            print("workflow.add('n" + str(aNode) + "', 'n" + str(aParentNode) + "', workflow.traverseDF);")
        print(" ")




def constructTreeWithLimit(fromNodes, toNodes):
    if fromNodes == 1:
        constructTree(toNodes)
        return
    for aNode in range(fromNodes, toNodes+1):
        nodeLevel = getLevelOfNodeIndex(aNode)
        start_index, end_index = getNodeLimitsForLevel(nodeLevel-1)
        for aParentNode in range(start_index,   end_index):
            print("     workflow.add('n" + str(aNode) + "', 'n" + str(aParentNode) + "', workflow.traverseDF);")
        print(" ")





#==================================================
#==================================================


numOfNodes = 500

for aNode in range(1, numOfNodes+1):
    print("if(numOfNodes == " + str(aNode) +"){")
    constructTreeWithLimit(aNode, aNode)
    print("}")
    print(" ")




#constructTreeWithLimit(5,5)