class ParsingUtility:

    def __init__(self):
        pass

    def getUserActivityTypeAndCollabID(self,aLogRow):
        return aLogRow.split(' ')[2].split('_')[0], aLogRow.split(' ')[2].split('_')[1]

    def getTimeStamp(self,aLogRow):
        # print(aLogRow)
        return aLogRow.split(' ')[0]

    def getPreviousLogOfThisUser(self,log, currentIndex, userIndex):
        for aRow in range(currentIndex - 1, 0, -1):
            userActivity, collabID = self.getUserActivityTypeAndCollabID(log[aRow])
            if int(collabID) == int(userIndex):
                return log[aRow]

        return None













class FileUtility:
    def __init__(self):
        pass

    def loadSimulationLog(self,filePath):
        simLog = ''
        with open(filePath, "r") as f:
            simLog = f.readlines()


        # remove the meta log info line (first line)
        return simLog#[1:len(simLog):]



    def splitAndSaveByCollabNum(self, inputFilePath,  outDir, nextFileIndex=1):
        nextFileIndex = nextFileIndex-1
        inputFile = self.loadSimulationLog(inputFilePath)

        for i in range(0, len(inputFile)):
            splitLen = len(inputFile[i].split())
            if(inputFile[i].split()[splitLen-1] == '=========================>'):
                nextFileIndex = nextFileIndex + 1

            with open(outDir + 'collab_' + str(nextFileIndex)+'.log', 'a') as the_file:
                the_file.write(inputFile[i])

        #print(len(inputFile[0].split()))

        # for i in range(0, len(inputFile)):
        #     with












from datetime import datetime

class TimeUtility:
    def __init__(self):
        pass

    # return time difference in miliseconds for two given times
    def getTimeDifference2(self,startTime, endTime):
        hourDiff = abs(int(endTime.split(':')[0]) - int(startTime.split(':')[0]))
        minDiff = abs(int(endTime.split(':')[1]) - int(startTime.split(':')[1]))
        secDiff = abs(int(endTime.split(':')[2].split('.')[0]) - int(startTime.split(':')[2].split('.')[0]))
        millDiff = abs(int(endTime.split(':')[2].split('.')[1]) - int(startTime.split(':')[2].split('.')[1]))

        return hourDiff * 3600000 + minDiff * 60000 + secDiff * 1000 + millDiff




    def getTimeDifference(self, startTime, endTime):
        a = datetime.strptime(startTime, '%H:%M:%S.%f')
        b = datetime.strptime(endTime, '%H:%M:%S.%f')

        return  abs((a-b).total_seconds()*1000)
        #print((b-a).total_seconds()*1000)



#TimeUtility().getNewTimeDiff('16:47:05.770', '16:47:06.772')