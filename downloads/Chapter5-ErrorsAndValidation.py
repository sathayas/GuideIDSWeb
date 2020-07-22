import numpy as np
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import confusion_matrix

# Loading the iris data
iris = datasets.load_iris()
X = iris.data  # array for the features
y = iris.target  # array for the target
feature_names = iris.feature_names   # feature names
target_names = iris.target_names   # target names

# spliting the data into training and testing data sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.333,
                                                    random_state=2020)

# Gaussian naive Bayes classifier
gnb = GaussianNB()  # defining the classifier object
gnb.fit(X_train, y_train)  # training the classifier with the training set
y_pred = gnb.predict(X_test)  # generating prediction with trained classifier

# confusion matrix
print(confusion_matrix(y_test,y_pred))

# classification report
print(classification_report(y_test, y_pred, target_names=target_names))
