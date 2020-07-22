#
# HISTOGRAM
#

# Simple histogram
hist(iris$Petal.Length)

# Histogram with custom bins
hist(iris$Petal.Length,breaks=c(1.0,3.0,4.5,4.0,6.9))


#
# BOXPLOTS
#

# Single boxplot
boxplot(iris$Petal.Length)

# Multiple boxplots
boxplot(iris$Petal.Length,iris$Petal.Width)
boxplot(iris)

# Notched boxplots
boxplot(iris,notch=TRUE)

# Stats from boxplots
print(boxplot(iris$Sepal.Width))


#
# SCATTER PLOTS
#

# Single scatter plot
plot(iris$Petal.Width,iris$Petal.Length)

# Scatter plots of all data
plot(iris)

# Different plot symbols
plot(iris$Petal.Width,iris$Petal.Length,
     pch=as.numeric(iris$Species))

# Identifying points
plot(iris$Petal.Width,iris$Petal.Length)
identify(iris$Petal.Width,iris$Petal.Length)

# Jitter plot coordinates
plot(jitter(iris$Petal.Width),jitter(iris$Petal.Length))

# Hexagonal binning
plot(iris$Petal.Width,iris$Petal.Length,
     col=rgb(0,0,0,50,maxColorValue=255),pch=16)
library(hexbin)
bin<-hexbin(iris$Petal.Width,iris$Petal.Length,xbins=50)
plot(bin)

# 3D plot
library(scatterplot3d)
scatterplot3d(iris$Sepal.Length,iris$Sepal.Width,iris$Petal.Length)


#
# PCA
#

# performing PCA
species <- which(colnames(iris)=="Species")
iris.pca <- prcomp(iris[,-species],center=T,scale=T)

# PCA results
print(iris.pca)
summary(iris.pca)

# Plotting PCs
plot(predict(iris.pca))


#
# MDS
#

library(MASS)
x <- iris[-102,]
species <- which(colnames(x)=="Species")
x.dist <- dist(x[,-species])
x.sammon <- sammon(x.dist,k=2)
plot(x.sammon$points)


#
# PARALLEL COORDINATES, RADAR, AND STAR PLOTS
#

library(MASS)
x <- iris
x$Species <- as.numeric(iris$Species)
parcoord(x)
stars(iris)
stars(iris,locations=c(0,0))


#
# CORRELATION COEFFICIENTS
#

cor(iris$Sepal.Length,iris$Sepal.Width)
cor.test(iris$Sepal.Length,iris$Sepal.Width,method="spearman")
cor.test(iris$Sepal.Length,iris$Sepal.Width,method="kendall")


#
# OUTLIERS
#

library(outliers)
grubbs.test(iris$Petal.Width)
