from analysisScripts.analysisTypes import *




fileUtility = FileUtility()
#fileUtility.splitAndSaveByCollabNum('../simulation_datasets/TurnBased/turnBased30.log', '../simulation_datasets/TurnBased/', 1)




for numOfCollab in range(16, 17):
    simLog = fileUtility.loadSimulationLog('../simulation_datasets/TurnBased/collab_'+ str(numOfCollab) +'.log')
    analysisTypes = AnalysisTypes(simLog[1:len(simLog):])
    print(analysisTypes.getAverageWaitTime(numOfCollab))




