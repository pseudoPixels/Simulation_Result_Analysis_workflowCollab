import numpy as np
import matplotlib.pyplot as plt

from matplotlib.ticker import NullFormatter  # useful for `logit` scale
from matplotlib.legend_handler import HandlerLine2D

import pandas as pd
import numpy as np

df=pd.read_csv('../Datasets/variants_tasks/total_design_time.csv')
df = df.values






plt.figure(1)

plt.subplot(221)
plt.plot(df[:,0], df[:,1], marker='.', label='Strict Module Locking')
plt.plot(df[:,0], df[:,2], marker='+', label='Attr. Level Locking')
plt.fill_between(df[:,0], df[:,1], df[:,2], where=df[:,2] >= df[:,1], facecolor='lightgray', interpolate=True)
plt.fill_between(df[:,0], df[:,1], df[:,2], where=df[:,2] < df[:,1], facecolor='slategray', interpolate=True)
plt.grid(True)
plt.title('Higher Dependency Node Requests - Composition Time')
plt.xlabel('Num. of Collaborators')
plt.ylabel('Composition Time (ms)')
plt.legend(loc="upper left")


# plt.subplot(222)
# plt.plot(df[:,0], df[:,3], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,4],  marker='+', label='Attr. Level Locking')
# plt.fill_between(df[:,0], df[:,3], df[:,4], where=df[:,4] >= df[:,3], facecolor='lightgray', interpolate=True)
# plt.fill_between(df[:,0], df[:,3], df[:,4], where=df[:,4] < df[:,3], facecolor='slategray', interpolate=True)
# plt.grid(True)
# plt.title('Higher Dependency Node Requests - Efficiency')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('E. Values')
# plt.legend(loc="upper right")




# df=pd.read_csv('../Datasets/variants_node_access_requests_LDD_exceptUserWaitingNodes.csv')
# df = df.values
#
# plt.subplot(223)
# plt.plot(df[:,0], df[:,3], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,4], marker='*', label='Attr. Level Locking')
# plt.fill_between(df[:,0], df[:,3], df[:,4], where=df[:,4] >= df[:,3], facecolor='slategray', interpolate=True)
# plt.fill_between(df[:,0], df[:,3], df[:,4], where=df[:,4] < df[:,3], facecolor='lightgray', interpolate=True)
# plt.grid(True)
# plt.title('Lower Dependency Node Requests - Composition Time')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Composition Time (ms)')
# plt.legend(loc="upper left")
#
#
#
#
# plt.subplot(224)
# plt.plot(df[:,0], df[:,7], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,8],  marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.fill_between(df[:,0], df[:,7], df[:,8], where=df[:,8] >= df[:,7], facecolor='slategray', interpolate=True)
# plt.fill_between(df[:,0], df[:,7], df[:,8], where=df[:,8] < df[:,7], facecolor='lightgray', interpolate=True)
# plt.title('Lower Dependency Node Requests - Efficiency')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('E. Values')
# plt.legend(loc="upper right")




#
# plt.subplot(233)
# plt.plot(df[:,0], df[:,5], marker='.', label='Strict Module Locking')
# plt.plot(df[:,0], df[:,6], marker='*', label='Attr. Level Locking')
# plt.grid(True)
# plt.title('4 All Connected Workflow Tree')
# plt.xlabel('Num. of Collaborators')
# plt.ylabel('Avg. Waiting Time (ms)')
# plt.legend(loc="upper left")
#
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


plt.show()
