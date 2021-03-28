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

        d3.json("http://localhost:4000/?query={artists(mini:50){artist artistname count}}").then(drawArtists)

## Ressources

- un bon cours sur D3.js : <http://using-d3js.com/index.html>

## Constitution des données

- on démarre depuis une extraction des titres de <https://musicbrainz.org/doc/MusicBrainz_Database> qui contiennent le mot `opus`
- on transforme les données pour obtenir les éléments suivants :
```
    {
      "artist": 879067,
      "artistname": "sergei prokofiev",
      "track": 12239831,
      "title": "piano concerto",
      "instrument": "piano",
      "numero": 3,
      "tonality": "c",
      "mode": "major",
      "opus": 26,
      "part": 3,
      "indication": "allegro ma non troppo"
    },
```

- on insère ces données dans le container `Mongo` :

        jq -c .titles[] titlesWithInstrument.json | grep tonality | docker exec -i docker-framework_mongo_1 sh -c 'mongoimport -d clasik -c titles --authenticationDatabase admin -u root -p example'

- créer la collection des artistes
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                artist:"$artist", 
                artistname:"$artistname"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            artist:"$_id.artist", 
            artistname:"$_id.artistname",
            count:1,
            _id:0
        }
    },
    {
        $out:"artists"
    }
])
```
- créer la collection des tonalités :
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                tonality:"$tonality", 
                mode:"$mode"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            tonality:"$_id.tonality", 
            mode:"$_id.mode",
            count:1,
            _id:0
        }
    },
    {
        $out:"tonalities"
    }
])
```
- créer la collection des instruments :
```
db.titles.aggregate([
    {
        $group:{
            _id:{
                instrument:"$instrument"
            },
            count:{
                $sum: 1
            }
        }
    }, 
    {
        $project:{
            instrument:"$_id.instrument",
            count:1,
            _id:0
        }
    },
    {
        $out:"instruments"
    }
])
```
