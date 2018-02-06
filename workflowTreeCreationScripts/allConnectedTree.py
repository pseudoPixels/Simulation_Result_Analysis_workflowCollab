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



NUM_OF_NODES = 20

for aNode in range(2, NUM_OF_NODES):
    nodeLevel = getLevelOfNodeIndex(aNode)
    start_index, end_index = getNodeLimitsForLevel(nodeLevel-1)
    for aParentNode in range(start_index,end_index):
        print(aNode, "->", aParentNode)

    print("==============")