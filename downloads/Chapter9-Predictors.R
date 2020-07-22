#
# TRAINING AND TESTING DATA
#

# generating indices for shuffling
n <- length(iris$Species)
permut <- sample(c(1:n),n,replace=F)

# shuffling the observations
ord <- order(permut)
iris.shuffled <- iris[ord,]

# splitting into training and testing data
prop.train <- 2/3  # training data consists of 2/3 of observations
k <- round(prop.train*n)
iris.training <- iris.shuffled[1:k,]
iris.test <- iris.shuffled[(k+1):n,]


#
# NEAREST NEIGHBOR CLASSIFIER
#

library(class)
iris.knn <- knn(iris.training[,1:4],iris.test[,1:4],iris.training[,5],k=3)
table(iris.knn,iris.test[,5])


#
# NEURAL NETWORKS
#

# converting target to numeric
x <- iris.training
x$Species <- as.numeric(x$Species)

# neural network with a hidden layer with 3 neurons
library(neuralnet)
iris.nn <- neuralnet(Species + Sepal.Length ~
                     Sepal.Width + Petal.Length + Petal.Width, x,
                     hidden=c(3))
plot(iris.nn)

# calculating predicted on the testing data
y <- iris.test
y <- y[-5]
y <- y[-1]
y.out <- compute(iris.nn,y)

# calculating squared errors
y.sqerr <- (y[1] - y.out$net.result[,2])^2


#
# SUPPORT VECTOR MACHINES
#

# svm classifier
library(e1071)
iris.svm <- svm(Species ~ ., data = iris.training)
table(predict(iris.svm,iris.test[1:4]),iris.test[,5])

# svm regression
iris.svm <- svm(Petal.Width ~ ., data = iris.training)
sqerr <- (predict(iris.svm,iris.test[-4])-iris.test[4])^2


#
# RANDOM FOREST
#

library(randomForest)
iris.rf <- randomForest(Species ~., iris.training)
table(predict(iris.rf,iris.test[1:4]),iris.test[,5])
