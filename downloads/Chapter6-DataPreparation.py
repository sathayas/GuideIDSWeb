import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

#
# MISSING VALUES
#

# Creating toy data sets (numerical)
X_train = pd.DataFrame()
X_train['X'] = [3, 2, 1, 4, 5, np.nan, np.nan, 5, 2]
X_test = pd.DataFrame()
X_test['X'] = [3, np.nan, np.nan]

# Creating toy data sets (categorical)
S_train = pd.DataFrame()
S_train['S'] = ['Hi', 'Med', 'Med', 'Hi', 'Low', 'Med', np.nan, 'Med', 'Hi']
S_test = pd.DataFrame()
S_test['S'] = [np.nan, np.nan, 'Low']

# Imputing numerical data with mean
imp_mean = SimpleImputer(missing_values=np.nan, strategy='mean')
X_train_imp = imp_mean.fit_transform(X_train)
X_test_imp = imp_mean.transform(X_test)

# Imputing categorical data with mode
imp_mode = SimpleImputer(missing_values=np.nan, strategy='most_frequent')
S_train_imp = imp_mode.fit_transform(S_train)
S_test_imp = imp_mode.transform(S_test)


#
# NORMALIZATION
#

from sklearn import datasets
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split

# loading the Iris data
iris = datasets.load_iris()
X = iris.data  # array for the features
y = iris.target  # array for the target
feature_names = iris.feature_names   # feature names
target_names = iris.target_names   # target names

# spliting the data into training and testing data sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.333,
                                                    random_state=2020)

# z-score normalization
normZ = StandardScaler()
X_train_Z = normZ.fit_transform(X_train)
X_test_Z = normZ.transform(X_test)

# min-max normalization
normMinMax = MinMaxScaler()
X_train_MinMax = normMinMax.fit_transform(X_train)
X_test_MinMax = normMinMax.transform(X_test)
