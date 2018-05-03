import numpy as np
import matplotlib.pyplot as plt

from matplotlib.ticker import NullFormatter  # useful for `logit` scale
from matplotlib.legend_handler import HandlerLine2D

import pandas as pd
import numpy as np

df=pd.read_csv('../Datasets/throughputComparision.csv')
df = df.values



plt.figure(1)

plt.subplot(121)
plt.plot(df[:,0], df[:,1], marker='.', label='Turn Based L.')
plt.plot(df[:,0], df[:,2], marker='*', label='Strict Module L.')
plt.plot(df[:,0], df[:,3], marker='1', label='Attr. Level L.')
plt.grid(True)
plt.title('Avg. Wait Time per Collabs.', fontsize=18)
plt.xlabel('Num. of Collaborators', fontsize=18)
plt.ylabel('Avg. Waiting Time (ms)', fontsize=18)
#plt.xaxis.label.set_size(20)
plt.legend(loc="upper left", fontsize=14)





plt.subplot(122)
plt.plot(df[:,0], df[:,7], marker='.', label='Turn Based L.')
plt.plot(df[:,0], df[:,8], marker='*', label='Strict Module L.')
plt.plot(df[:,0], df[:,9], marker='1', label='Attr. Level L.')
plt.grid(True)
plt.title('Num. of Updates per Min.', fontsize=18)
plt.xlabel('Num. of Collaborators', fontsize=18)
plt.ylabel('Avg. Update Counts per Min.', fontsize=18)
plt.legend(loc="upper left", fontsize=14)





#
# plt.subplot(234)
# plt.plot(df[:,0], df[:,7], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,8], marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('2 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(235)
# plt.plot(df[:,0], df[:,9], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,10], marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('3 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(236)
# plt.plot(df[:,0], df[:,11], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,12], marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('4 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
plt.show()



###### COLOR BLACK


#
# plt.figure(1)
#
# plt.subplot(231)
# plt.plot(df[:,0], df[:,1], color='black',marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,2], color='black',   marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('2 All Connected Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(232)
# plt.plot(df[:,0], df[:,3], color='black', marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,4], color='black', marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('3 All Connected Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(233)
# plt.plot(df[:,0], df[:,5], color='black', marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,6], color='black', marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('4 All Connected Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(234)
# plt.plot(df[:,0], df[:,7], color='black', marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,8], color='black', marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('2 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(235)
# plt.plot(df[:,0], df[:,9], color='black', marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,10], color='black', marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('3 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.subplot(236)
# plt.plot(df[:,0], df[:,11], color='black', marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,12], color='black', marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('4 Reg. Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
#
# plt.show()

