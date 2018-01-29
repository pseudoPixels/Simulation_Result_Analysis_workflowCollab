from analysisScripts.analysisTypes import *




fileUtility = FileUtility()
#fileUtility.splitAndSaveByCollabNum('../simulation_datasets/TurnBased/turnBased30.log', '../simulation_datasets/TurnBased/', 1)









print("\n\n")
print("===============================================")
print("AVG. WAITING TIME PER COLLAB")
for numOfCollab in range(1, 20):
    simLog = fileUtility.loadSimulationLog('../simulation_datasets/TurnBased/collab_'+ str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getAverageWaitTime(numOfCollab))




print("\n\n")
print("===============================================")
print("TOTAL WORKFLOW DESIGN TIME")
for numOfCollab in range(1, 20):
    simLog = fileUtility.loadSimulationLog('../simulation_datasets/TurnBased/collab_'+ str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getCollaborativeWorkflowDesignTime())






print("\n\n")
print("===============================================")
print("AVG. UPDATES PER MIN")
for numOfCollab in range(1, 20):
    simLog = fileUtility.loadSimulationLog('../simulation_datasets/TurnBased/collab_'+ str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getTotalUpdatesPerUnitTime(60000))



print("\n\n")
print("===============================================")
print("EFFICEINCY")
for numOfCollab in range(1, 20):
    simLog = fileUtility.loadSimulationLog('../simulation_datasets/TurnBased/collab_'+ str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getWorkflowCompositionEfficiency(numOfCollab, 25))
