from analysisScripts.analysisUtility import *

class AnalysisTypes:
    log = ''
    def __init__(self, simlog):
        self.log = simlog



    def getTotalWaitingTimeOfThisUser(self, userIndex):
        total_waiting_time = 0
        myLogParser = ParsingUtility()
        for i in range(0, len(self.log)):

            userActivity, collabID = myLogParser.getUserActivityTypeAndCollabID(self.log[i])

            if int(collabID) == int(userIndex) and userActivity == 'WAITING':
                prevLog = myLogParser.getPreviousLogOfThisUser(self.log, i, userIndex)
                prevTimeStamp = myLogParser.getTimeStamp(prevLog)
                thisTimeStamp = myLogParser.getTimeStamp(self.log[i])
                total_waiting_time += TimeUtility().getTimeDifference(thisTimeStamp, prevTimeStamp)
            if int(collabID) == int(userIndex) and userActivity == 'END':
                return total_waiting_time

        return -1




    def getAverageWaitTime(self, num_of_collabs):
        totalWaitTime = 0
        for aCollab in range(0, num_of_collabs):
            t = self.getTotalWaitingTimeOfThisUser(aCollab)
            totalWaitTime += t

        return totalWaitTime / num_of_collabs





    def getCollaborativeWorkflowDesignTime(self):
        startLog = self.log[0] #the first log while designing this workflow
        endLog = self.log[len(self.log)-1] #the end log while designing this workflow

        myLogParser = ParsingUtility()
        startLogTime = myLogParser.getTimeStamp(startLog)
        endLogTime  = myLogParser.getTimeStamp(endLog)

        myLogTimeUtil = TimeUtility()

        return myLogTimeUtil.getTimeDifference(startLogTime, endLogTime)





    def getTotalNumberOfUpdates(self):
        numOfUpdates = 0
        myLogParser = ParsingUtility()

        for i in range(0, len(self.log)):
            userActivity, collabID = myLogParser.getUserActivityTypeAndCollabID(self.log[i])
            if userActivity == 'UPDATE':
                numOfUpdates += 1

        return numOfUpdates





    def getTotalUpdatesPerUnitTime(self, perUnitTime):
        updatePerMilliSec  = self.getTotalNumberOfUpdates() / self.getCollaborativeWorkflowDesignTime()

        return updatePerMilliSec*perUnitTime



    #TODO: fix the calculation from Confucius paper
    def getWorkflowCompositionEfficiency(self, numOfCollabs, numOfTasks):
        totalUpdates = self.getTotalNumberOfUpdates()
        totalCompositionTime = self.getCollaborativeWorkflowDesignTime()

        return  totalUpdates*100/((totalCompositionTime/60000)*numOfTasks*numOfCollabs)