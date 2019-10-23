# Masterdata Management

Context informationen management in measurement and processing infrastructures for distributed architectures with independent and isolated services for integration, processing and consumption tasks.
The service provides a management instance that provides access to the knowledge about sensors and the corresponding context via a query language.

[![Build Status](https://travis-ci.org/winner-potential/masterdata.svg?branch=master)](https://travis-ci.org/winner-potential/masterdata)

## Start

The service is available as a docker image, requires a MongoDB for data storage, and can be started using the following docker compose.
The authentication and authorization is realized via LDAP.
If this is not available for testing purposes, the profile `dev` can be activated, so that no credential checking takes place, and all users will be authorized as administrators.

### Docker

Use the following commands to start the MongoDB and Masterdata instance:

```bash
docker run -v /data/db --name mongodb mongo:3.6.5-jessie
docker run -p 3000:3000 -v /var/lib/app/img --link mongodb -e DATABASE=mongodb://mongodb/masterdata -e BASEPATH=http://localhost:3000/ -e PROFILE=dev masterdatamgmt/full:latest
```

### Docker-Compose

Use the following `docker-compose.yml` to start the MongoDB and Masterdata instance:

``` yml
version: "3"

services:
  db: 
    image: mongo:3.6.5-jessie
    volumes:
      - 'data:/data/db'
  backend:
    image: masterdatamgmt/full:latest
    environment:
      DATABASE: "mongodb://db/masterdata"
      BASEPATH: "http://localhost:3000/"
      SECRET: "SOME-REALLY-GOOD-SECRET"
      LDAP_URL: "ldap://ldap:389"
      LDAP_DN: "uid=:username:,ou=people,dc=example,dc=com"
      LDAP_GROUP_FILTER: "(memberuid=:username:)"
      LDAP_GROUP_BASE: "ou=groups,dc=example,dc=com"
      LDAP_GROUP_ADMINS: "admin_group_cn"
      # Currently, only LDAP is supported... switch to dev profile which  
      # accepts any user credential as admin (for test and dev purposes only)
      # PROFILE: "dev"
    volumes:
      - 'img:/var/lib/app/img'
    ports:
      - 3000:3000

volumes:
  data:
  img:
```

Finally, use the following command to start this setup:

``` bash
docker-compose up
```

## Get Started

### Example Data Model

The following steps are necessary to configure the first correlations in Masterdata Management.
In this example, a sensor is created that generates a temperature measurement and describes a home as a context.

- Open http://localhost:3000
- Switch to Admin Area
- Create one Tags Template, use name `device` and save
- Create one Metric Template, use name `temperature` and add `device` Tag and save
- Create two Document Template, to describe the abstract structure
  - First one, use name `sensor`, select Attribute-Type `String` and name it `id` and press plus; finally, add the metric `temperature` and save
  - Second one, use name `location`, select Attribute-Type `String` and name it `id` and press plus; finally, add the metric `temperature` and save
- Create two Documents, to describe the instances
  - First one, use name `first-sensor`, select Template `sensor` and provide an ID `abc`; Press blue metric button in lower right, mark source and select `temperature` and press add
    - Expand source metric details, use as Key `t`
    - Set `device` to `sensor-:id:`
    - Finally, save
  - Second one, use name `at-home`, select Template `location` and provide an ID `my-home`; Press blue metric button in lower right, mark relation and select `temperature` and press add
    - Expand relation for metric details
    - Search in `Reference Document` for `first-sensor`
    - Finally, save

**tl;dr** You can take a look at the [Masterdata-Importer](https://github.com/winner-potential/masterdata-importer) to initialize the database entries.

### Request Metrics by Type

An integration service, which has to be realized without specific knowledge, would query the masterdata management as in the following to obtain all metric descriptions to be captured for the sensor identifier `abc`.
The result is a series of metrics to be captured in which the tags are resolved according to their placeholders and the context is noted.
The integration service should map measured values via `key` to the query result.

``` bash
# Ask for token
TOKEN=$(curl --silent -X POST http://localhost:3000/api/v1.0/authentificate/ -H "Content-Type: application/json" -d '{"username":"you","password":"secret"}' 2>&1  | sed -e 's/.*"token":"\(.*\)".*/\1/g')

# List resolved metrics
curl -X POST http://localhost:3000/api/v1.0/metric/resolve -H "Content-Type: application/json" -d '{"query": "sensor[id=abc]"}' -H "x-access-token: $TOKEN"
```

Put simply, a metric can be requested in two steps:

- First, obtain an authentication token by sending a HTTP POST request to
  `[your-service]/api/v1.0/authentificate/`. The request header shoud have `Content-Type`
  set to `application/json`. The body must be a JSON object with the two attributes
  `username` and `password` set to their appropriate values.
- On successful authentication, a JSON object containing the authentication token is returned.
  Using that token, metrics can be requested by sending a HTTP POST request to
  `[your-service]/api/v1.0/metric/resolve/`. The request header again needs to have `Content-Type`
  set to `application/json` as well as an additional attribute `x-access-token` set to the access token
  obtained in the previous step. The request body is a JSON object with the attribute `query` containing
  your query.

### Query Language

The query syntax for resolve requests allows you to address subtrees from the structure.
The names of the document templates are used for addressing, e.g., `sensor`.
These can be specified using a path syntax, e.g., `something/sensor`.
Each addressed template can be filtered using attributes, e.g., `something/sensor[id=123]`.
It is possible to use wildcards, e.g., `something/*[id=123]`.
As special case serves `**`, which addresses the children of a wildcard query.
The syntax for the query is as follows:

``` 
name = < letter | digit >
document-template = name | "*" | 
  "**" | ('"' string '"')
attribute-name = name | ('"' string '"')
attribute-value = name | ('"' string '"')
pair = attribute-name "=" attribute-value
attributes = "[" pair { "," pair } "]"
selector = document-template [ attributes ]
query = selector { "/" selector }
```

## Contributing

  [Contributing](CONTRIBUTING.md)

## License

  [MIT](LICENSE)
