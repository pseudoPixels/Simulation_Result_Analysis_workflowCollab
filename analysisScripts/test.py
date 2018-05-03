from analysisScripts.analysisTypes import *


parentDir = '../simulation_datasets/TurnBased2/' #'../simulation_datasets/AttributeLevelLocking/AllConnectedWorkflowTrees/'
newSplittedDatasetDir = '' #'attributeLevelLocking_25tasks_4AllConnectedTree_19Collabs_Node:getNodeWithLowerDependencyDegree_exceptUserLockedNode_Attr:getNodeWithHigherDependencyDegree_exceptUserLockedAndWaitingNodes()'
datasetFile = newSplittedDatasetDir + '.log'


fileUtility = FileUtility()
#fileUtility.splitAndSaveByCollabNum(parentDir+datasetFile, parentDir + 'SplittedDataset/' + newSplittedDatasetDir+'/', 1)

#fileUtility.splitAndSaveByCollabNum('../simulation_datasets/Different_Dimensions/Variants_of_tasks/AttributeLevelLocking/collabs20/collabs20tasks100.log', '../simulation_datasets/Different_Dimensions/Variants_of_tasks/AttributeLevelLocking/collabs20/' , 1)





#DATASET_FILE_PATH = parentDir + 'SplittedDataset/' + newSplittedDatasetDir+'/collab_'
DATASET_FILE_PATH = '../simulation_datasets/Different_Dimensions/Variants_of_tasks/AttributeLevelLocking/collabs5/tasks_'
print("\n\n")
print("===============================================")
print("AVG. WAITING TIME PER COLLAB")
upperLimit = 80
for numOfCollab in range(1, upperLimit):
    simLog = fileUtility.loadSimulationLog(DATASET_FILE_PATH + str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getAverageWaitTime(numOfCollab))




print("\n\n")
#print("===============================================")
print("TOTAL WORKFLOW DESIGN TIME")
for numOfCollab in range(1, upperLimit):
    simLog = fileUtility.loadSimulationLog(DATASET_FILE_PATH + str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getCollaborativeWorkflowDesignTime())






print("\n\n")
#print("===============================================")
print("AVG. UPDATES PER MIN")
for numOfCollab in range(1, upperLimit):
    simLog = fileUtility.loadSimulationLog(DATASET_FILE_PATH + str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getTotalUpdatesPerUnitTime(60000))



print("\n\n")
#print("===============================================")
print("EFFICEINCY")
for numOfCollab in range(1, upperLimit):
    simLog = fileUtility.loadSimulationLog(DATASET_FILE_PATH + str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getWorkflowCompositionEfficiency(numOfCollab, 25))
