import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
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
# DECISION TREE CLASSIFIER
#

# decision tree classifier
dt = DecisionTreeClassifier(criterion='entropy',
                            min_samples_leaf = 3,
                            max_depth = 4,
                            random_state=0)
dt.fit(X_train,y_train)

# classification on the testing data set
y_pred = dt.predict(X_test)
print(confusion_matrix(y_test,y_pred))
print(classification_report(y_test, y_pred,
                            target_names=target_names))

# plotting the tree
plt.figure(figsize=[4,4])
plot_tree(dt, feature_names=feature_names, class_names=target_names)
plt.show()


#
# LINEAR REGRESSION
#
from sklearn.linear_model import LinearRegression

# Target is petal width
y = iris.data[:,3]
# All the other variables are input features
X = iris.data[:,:3]

# linear regression learner
reg = LinearRegression().fit(X,y)

# Information about the regression model
print(reg.score(X,y))   # R-square
print(reg.coef_)   # Regression coefficients
print(reg.intercept_)  # and the intercept

# Observed vs predicted plot
y_pred = reg.predict(X)
plt.plot(X[:,0], y, 'b.', label='observed')
plt.plot([X[:,0].min(), X[:,0].max()], [y_pred.min(), y_pred.max()],
         'r-', label='predicted')
plt.xlabel('Sepal length')
plt.ylabel('Petal width')
plt.legend()
plt.show()
