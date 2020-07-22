#
# MISSING VALUES
#

# mean of a vector with missing values
x <- c(3,2,NA,4,NA,1,NA,NA,5)
mean(x)
mean(x,na.rm=T)


#
# NORMALIZATION
#

# using the iris data as an example
iris.norm <- iris

# for loop over each coloumn
for (i in c(1:length(iris.norm))){
    if (!is.factor(iris.norm[,i])){
        attr.mean <- mean(iris.norm[,i])
        attr.sd <- sd(iris.norm[,i])
        iris.norm[,i] <- (iris.norm[,i]-attr.mean)/attr.sd
    }
}
