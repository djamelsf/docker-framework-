# Framework de visualisation de données avec Docker

## Installation

- construire le container `graphql` :

        $ cd graphql
        $ rm -fr node_modules/
        $ docker build -t graphql .

- démarrer la pile de containers graphql/mongo

        $ cd ..
        $ docker-compose -f stack.yml up -d

- accéder à l'application : Ouvrir la page `ui/index.html` avec le navigateur

## Axes de développement

### Un premier axe concerne le développement des requêtes `graphQL`.

- désactiver le container `graphQL` de la pile Docker
- déterminer l'adresse IP du container `Mongo`

        $ docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' docker-framework_mongo_1
        172.18.0.3

- inscrire cette adresse en dur dans le résolveur `graphql/resolvers.js`

        const url = 'mongodb://root:example@172.18.0.3:27017';

- effectuer le développement des requêtes en modifiant le schéma, les résolveurs et en utilisant le *playground*

- lorsque le développement du connecteur `graphQL` est stable, modifier l'adresse IP du container `Mongo` dans le résolveur :

        const url = 'mongodb://root:example@mongodb:27017';

- puis construisez le container :

        $ docker build -t graphql .

- vous pouvez maintenant l'intégrer à la pile

### Le deuxième axe concerne le développement des pages .HTML

Vous pouvez utiliser `D3.js` pour effectuer la visualisation des données obtenues par `graphQL` :

        d3.json("http://localhost:4000/?query={genres(mini:0){genre count}}").then(drawGenres)


## Constitution des données

- on démarre depuis une extraction des jeux de <https://www.kaggle.com/rush4ratio/video-game-sales-with-ratings>
- on transforme les données pour obtenir les éléments suivants :
```
   {
    "Name": "Wii Sports",
    "Platform": "Wii",
    "Year_of_Release": "2006",
    "Genre": "Sports",
    "Publisher": "Nintendo",
    "NA_Sales": 41.36,
    "EU_Sales": 28.96,
    "JP_Sales": 3.77,
    "Other_Sales": 8.45,
    "Global_Sales": 82.53,
    "Critic_Score": 76,
    "Critic_Count": 51,
    "User_Score": "8",
    "User_Count": 322,
    "Developer": "Nintendo",
    "Rating": "E"
   },
```

- on insère ces données dans le container `Mongo` :

        jq -c .games[] games.json | docker exec -i docker-framework_mongo_1 sh -c 'mongoimport -d gamesDB -c games --authenticationDatabase admin -u root -p example'

- créer la collection des plates-formes
```
db.games.aggregate([
{
    $group:{
        _id:{
            platform:"$Platform",
        },
        count:{
            $sum: 1
        }
    }
}, 
{
    $project:{ 
        platform:"$_id.platform",
        count:1,
        _id:0
    }
},
{
    $out:"platforms"
}
])
```
- créer la collection des éditeurs :
```
db.games.aggregate([
{
    $group:{
        _id:{
            publisher:"$Publisher",
        },
        count:{
            $sum: 1
        }
    }
}, 
{
    $project:{ 
        publisher:"$_id.publisher",
        count:1,
        _id:0
    }
},
{
    $out:"publishers"
}
])
```
- créer la collection des genres :
```
db.games.aggregate([
{
    $group:{
        _id:{
            genre:"$Genre",
        },
        count:{
            $sum: 1
        }
    }
}, 
{
    $project:{ 
        genre:"$_id.genre",
        count:1,
        _id:0
    }
},
{
    $out:"genres"
}
])
```
- créer la collection Plate-forme par année :
```
db.games.aggregate([
{
    $group:{
        _id:{
            platform:"$Platform",
            year_of_release:"$Year_of_Release"
        },
        count:{
            $sum: 1
        }
    }
}, 
{
    $project:{ 
        platform:"$_id.platform",
        year_of_release:"$_id.year_of_release",
        count:1,
        _id:0
    }
},
{
    $out:"platforms_by_year"
}
])
