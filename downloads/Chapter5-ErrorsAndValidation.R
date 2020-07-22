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
