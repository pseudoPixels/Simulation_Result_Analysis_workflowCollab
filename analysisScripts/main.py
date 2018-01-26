from analysisScripts.analysisTypes import *




fileUtility = FileUtility()
simLog = fileUtility.loadSimulationLog('../simulation_datasets/1_collab_25_tasks.log')



analysisTypes = AnalysisTypes(simLog)
print('Average Wait Time', analysisTypes.getAverageWaitTime(4))

