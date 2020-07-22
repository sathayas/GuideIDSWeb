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


#
# HIERARCHICAL CLUSTERING
#

# with the Ward method (defualt)
iris.num <- iris.norm[1:4]
iris.cl <- hclust(dist(iris.num), method="ward")
plot(iris.cl)

# Heatmap
library(gplots)
rowv <- as.dendrogram(hclust(dist(iris.num), method="ward"))
colv <- as.dendrogram(hclust(dist(t(iris.num)), method="ward"))
heatmap.2(as.matrix(iris.num), Rowv=rowv,Colv=colv, trace="none")


#
# K-MEANS CLUSTERING
#

iris.km <- kmeans(iris.num,centers=3)
print(iris.km)


#
# FUZZY C-MEANS CLUSTERING
#

library(cluster)
iris.fcm <- fanny(iris.num,3)
iris.fcm


#
# GAUSSIAN MIXTURE DECOMPOSITION
#

library(mclust)
iris.em <- mclustBIC(iris.num[,1:4])
iris.mod <- mclustModel(iris.num[,1:4],iris.em)
summary(iris.mod)


#
# DBSCAN CLUSTERING
#

library(fpc)
iris.dbscan <- dbscan(iris.num[,1:4],1.0,showplot=T)
iris.dbscan$cluster


#
# SELF ORGANIZING MAPS
#

library(som)
iris.som <- som(iris.num,xdim=5,ydim=5)
plot(iris.som)


#
# ASSOCIATION RULES
#

library(arules)
baskets <- list(c("a","b","c"), c("a","d","e"),
                c("b","c","d"), c("a","b","c","d"),
                c("b","c"), c("a","b","d"),
                c("d","e"), c("a","b","c","d"),
                c("c","d","e"), c("a","b","c"))
rules <- apriori(baskets,parameter = list(supp=0.1,conf=0.8,target="rules"))
inspect(rules)
