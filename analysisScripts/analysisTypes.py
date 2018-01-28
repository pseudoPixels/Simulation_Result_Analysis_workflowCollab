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


