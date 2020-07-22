#
# DECISION TREES
#

library(rpart)
iris.train <- c(sample(1:150,50))
iris.dtree <- rpart(Species~.,data=iris,subset=iris.train)

library(rattle)
drawTreeNodes(iris.dtree)
table(predict(iris.dtree,iris[-iris.train,],type="class"),
      iris[-iris.train,"Species"])


#
# NAIVE BAYES
#

library(e1071)
iris.train <- c(sample(1:150,75))
iris.nbayes <- naiveBayes(Species~.,data=iris,subset=iris.train)
table(predict(iris.nbayes,iris[-iris.train,],type="class"),
      iris[-iris.train,"Species"])

print(iris.nbayes)


#
# REGRESSION
#

# linear regression
iris.lm <- lm(iris$Petal.Width ~ iris$Sepal.Length
              + iris$Sepal.Width + iris$Petal.Length)
summary(iris.lm)

# quadratic regression
iris.lm <- lm(iris$Petal.Width ~ iris$Petal.Length +
              I(iris$Petal.Length^2))
summary(iris.lm)

# ridge regression
library(MASS)
iris.rlm <- rlm(iris$Petal.Width ~ iris$Sepal.Length
                + iris$Sepal.Width + iris$Petal.Length)
summary(iris.rlm)

# ridge regression with Tukey's biweight
iris.rlm <- rlm(iris$Petal.Width ~ iris$Sepal.Length
                + iris$Sepal.Width + iris$Petal.Length,
                method="MM")
summary(iris.rlm)
plot(iris.rlm$w)
