import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import confusion_matrix, classification_report

# Loading data
iris = load_iris()
X = iris.data
y = iris.target
feature_names = iris.feature_names
target_names = iris.target_names

# spliting the data into training and testing data sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=50,
                                                    random_state=2020)


#
# NERAEST NEIGHBOR CLASSIFIER
#

# k nearest neighbor classifier objects, with k=5 neighbors
kNN = KNeighborsClassifier(5, weights='uniform')

# training on the training data
kNN.fit(X_train,y_train)

# Predicted classes
y_pred = kNN.predict(X_test)

# classifier performance
print(confusion_matrix(y_test,y_pred))
print(classification_report(y_test, y_pred, target_names=target_names))


#
# NEURAL NETWORK CLASSIFIER
#

from sklearn.neural_network import MLPClassifier

# Multi-layer preceptron classifier object
#     stochastic gradient descent solver
#     two hidden layers with 4 and 2 neurons, respectively
mlp = MLPClassifier(solver='sgd',
                    hidden_layer_sizes=(4, 2), random_state=2020)

# training on the training data
mlp.fit(X_train,y_train)

# Predicted classes
y_pred = mlp.predict(X_test)

# classifier performance
print(confusion_matrix(y_test,y_pred))
print(classification_report(y_test, y_pred, target_names=target_names))


#
# SUPPORT VECTOR MACHINE CLASSIFIER
#

from sklearn.svm import SVC

# SVM classifier object -- linear kernel and C=0.1
svc = SVC(kernel='linear', C=0.1)

# training on the training data
svc.fit(X_train,y_train)

# predicted classes
y_pred = svc.predict(X_test)   # predicted class

# classifier performance
print(confusion_matrix(y_test,y_pred))
print(classification_report(y_test, y_pred, target_names=target_names))


#
# SUPPORT VECTOR REGRESSION
#
from sklearn.svm import SVR
from sklearn.metrics import r2_score

# SVM regression object -- linear kernel and C=0.1
svr = SVR(kernel='linear', C=0.1)

# training on the petal width as the target, features = all other variables
svr.fit(X_train[:,:3],X_train[:,3])

# predicted outcomes
y_pred = svr.predict(X_test[:,:3])

# R-squared
print(r2_score(X_test[:,3], y_pred))

# plotting observed vs predicted (sepal length on x-axis)
plt.plot(X_test[:,0], X_test[:,3],'b.', label='observed')
plt.plot(X_test[:,0], y_pred, 'r.', label='predicted')
plt.xlabel(feature_names[0])
plt.ylabel(feature_names[3])
plt.legend()
plt.show()


#
# RANDOM FOREST CLASSIFIER
#
from sklearn.ensemble import RandomForestClassifier

# random forest classifier object
#    criterion is based on entropy
#    100 trees
#    minimum leaf size = 3
#    max depth of 4
rf = RandomForestClassifier(criterion='entropy',
                            n_estimators = 100,
                            min_samples_leaf = 3,
                            max_depth = 4,
                            random_state=2020)

# training on the training data
rf.fit(X_train,y_train)

# prediction based on the testing data
y_pred = rf.predict(X_test)

# evaluating the classifier performance
print(confusion_matrix(y_test,y_pred))
print(classification_report(y_test, y_pred,
                            target_names=target_names))
