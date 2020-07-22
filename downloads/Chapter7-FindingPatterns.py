import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering, KMeans, DBSCAN

# Loading the iris data
iris = datasets.load_iris()
X = iris.data  # array for the features
y = iris.target  # array for the target
feature_names = iris.feature_names   # feature names
target_names = iris.target_names   # target names

# z-score normalization using fit_transform method
X_norm = StandardScaler().fit_transform(X)


#
# HIEAARCHICAL CLUSTERING
#

# Hierarchical clustering
hc = AgglomerativeClustering(n_clusters=3, linkage='ward')
hc.fit(X_norm)  # actually fitting the data
y_clus = hc.labels_   # clustering info resulting from hieararchical

# Plotting the clusters
plt.scatter(X_norm[:,3],X_norm[:,0],c=y_clus,marker='+')
plt.show()


#
#  DENDROGRAM
#

from scipy.cluster.hierarchy import dendrogram, linkage

D = linkage(X_norm, 'ward')
dn = dendrogram(D)
plt.show()


#
# K-MEANS CLUSTERING
#

# K-means clustering
km = KMeans(n_clusters=3)  # defining the clustering object
km.fit(X)  # actually fitting the data
y_clus = km.labels_   # clustering info resulting from K-means

# Plotting the clusters
plt.scatter(X_norm[:,3],X_norm[:,0],c=y_clus,marker='+')
plt.show()


#
# ELBOW METHOD
#

SSE = []
for iClus in range(1,21):
    # K-means clustering
    km = KMeans(n_clusters=iClus)  # K-means with a given number of clusters
    km.fit(X_norm)  # fitting the principal components
    SSE.append(km.inertia_) # recording the sum of square distances

# plotting the sum of square distance (a.k.a., inertia)
plt.plot(np.arange(1,21),SSE,marker = "o")
plt.xlabel('Number of clusters')
plt.ylabel('Inertia')
plt.show()


#
# DBSCAN
#

# DBSCAN clustering
dbscan = DBSCAN()  # defining the clustering object
dbscan.fit(X_norm)  # fitting the data
y_clus = dbscan.labels_   # cluster labels
indCore = dbscan.core_sample_indices_   # indices of core points

# plotting non-noise points
plt.scatter(X_norm[y_clus>0,3],X_norm[y_clus>0,0], c=y_clus[y_clus>0],
            marker='o', s=10)
# plotting core points
plt.scatter(X_norm[indCore,3], X_norm[indCore,0],c=y_clus[indCore],
            marker='o', s=100)
# plotting noise points
plt.scatter(X_norm[y_clus==-1,3],X_norm[y_clus==-1,0], c='r',
            marker='o', s=10)
plt.show()
