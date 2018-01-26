#return time difference in miliseconds for two given times
def getTimeDifference(startTime, endTime):
    hourDiff = abs(int(endTime.split(':')[0]) - int(startTime.split(':')[0]))
    minDiff = abs(int(endTime.split(':')[1]) - int(startTime.split(':')[1]))
    secDiff = abs(int(endTime.split(':')[2].split('.')[0]) - int(startTime.split(':')[2].split('.')[0]))
    millDiff = abs(int(endTime.split(':')[2].split('.')[1]) - int(startTime.split(':')[2].split('.')[1]))

    return hourDiff*3600000 + minDiff*60000 + secDiff*1000 + millDiff



def getUserActivityTypeAndCollabID(aLogRow):
    return aLogRow.split(' ')[2].split('_')[0], aLogRow.split(' ')[2].split('_')[1]


def getTimeStamp(aLogRow):
    #print(aLogRow)
    return aLogRow.split(' ')[0]


def getPreviousLogOfThisUser(log, currentIndex, userIndex):
    for aRow in range(currentIndex-1, 0, -1):
        userActivity, collabID = getUserActivityTypeAndCollabID(log[aRow])
        if int(collabID)==int(userIndex):
            return log[aRow]


    return None



def getTotalWaitingTimeOfThisUser(log, userIndex):
    total_waiting_time = 0
    for i in range(0, len(log)-1):
        userActivity, collabID = getUserActivityTypeAndCollabID(log[i])

        if int(collabID)==int(userIndex) and userActivity=='WAITING':
            prevLog = getPreviousLogOfThisUser(log, i, userIndex)
            prevTimeStamp = getTimeStamp(prevLog)
            thisTimeStamp = getTimeStamp(log[i])
            total_waiting_time += getTimeDifference(thisTimeStamp, prevTimeStamp)
        if int(collabID)==int(userIndex) and userActivity=='END':
            return total_waiting_time

    return 0



def loadSimulationLog(filePath):
    simLog = ''
    with open(filePath, "r") as f:
        simLog = f.readlines()

    #remove the meta log info line (first line)
    return simLog[1:len(simLog):]


def getAverageWaitTime(log, num_of_collabs):
    totalWaitTime = 0
    for aCollab in range(0, num_of_collabs):
        t = getTotalWaitingTimeOfThisUser(log, aCollab)
        totalWaitTime += t

    return totalWaitTime/num_of_collabs








simLog = loadSimulationLog('../simulation_datasets/1_collab_25_tasks.log')
print('Average Wait Time', getAverageWaitTime(simLog, 4))