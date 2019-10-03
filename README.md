# Profile Service

The purpose of the profile service is to provide locked data to be used by the tests. This allows you to avoid concurrency issues. You store multiple profile entries meta data inside of the service (MongoDB backend), then when you run your test, you call the service which claims/locks one of those profile entries so that another test can't use it. Each profile entry will automatically unlock after 10 minutes whether you explicitly unlock it or not.

You do not need to create a profile before adding entries to it. You simply need to add a profile entry to a specific profile name, and that profile entry will get added for that specific profile name.

## Configuration

The following environment variables are used. Change them if you would like different values.  

|Environment Variable|Description                                                        |Default  |
|--------------------|-------------------------------------------------------------------|----------
|PROFILE_MONGOHOST   |This is the MongoDB hostname.                                      |localhost|
|PROFILE_MONGODB     |This is the MongoDB database.                                      |test     |
|NODE_PORT           |This is the port that the profile service will run on.             |8080     |

## Requirements

### Node.js

We have tested this on Node 8.9.0 and 10.15.0. We use async/await, so you will need at least Node 8 or greater.

### MongoDB

You will need at least MongoDB 3.0 or greater. Anything lower is not compatible with the version of Mongoose used and Node.js needed.

All of the data from the profile service is stored in a MongoDB. To get a MongoDB setup using docker, follow these steps (Requires [Docker](#installing-docker)) :  
```
mkdir ~/data
docker run -d -p 27017:27017 -v ~/data:/data/db mongo
```

### Docker

Docker is not required, however if you would like to use the MongoDB docker image, you will need docker.

#### Installing Docker
https://docs.docker.com/docker-for-mac/install/  
https://docs.docker.com/docker-for-windows/install/  
https://docs.docker.com/install/linux/docker-ce/ubuntu/

## Start Profile Service

After starting MongoDB, you can start the profile service:  
```
npm run cicd-build
npm run start
```

## Profile Service Usage:

### Steps to use profile service
1) Add entry to profile ( POST /profile/{name} ) [See the 1st API request](#calling-the-profile-service-api)
2) In your test, when it runs, request a profile entry ( GET /profile/{name}/next ) [See the 2nd API request](#calling-the-profile-service-api)
3) At the end of your test, release the profile entry so another test can use it ( POST /profile/{id}/release ) [See the 3rd API request](#calling-the-profile-service-api)

### Calling the profile service API

Sample in javascript:

* First `npm install axios`

``` javascript
const axios = require('axios');

const profileServiceUrl = 'http://localhost:8080';

// 1st API request - Add data to profile in the profile service.
// This will be done prior to your tests running.
async function addToProfile(profileName, profileData) {
  return axios.post(`${profileServiceUrl}/profile/${profileName}`, profileData);
}

// 2nd API request - Retrieves an object from the profile service.
// This will lock that profile so another test can not use it.
async function getProfile(profileName) {
  return axios.get(`${profileServiceUrl}/profile/${profileName}/next`);
}

// 3rd API request - Releases profile lock, so another test can get this profile.
async function releaseProfile(profileId) {
  return axios.post(`${profileServiceUrl}/profile/${profileId}/release`);
}

async function main() {
  const profileName = encodeURIComponent(process.env.PROFILE_NAME);
  const profileData = {
    username: 'myTestUserNamne',
    password: 'myTestPassword1'
  };

  let r = await addToProfile(profileName, profileData);
  console.log(`Response from adding to profile : ${JSON.stringify(r.data, null, 2)}`);
  r = await getProfile(profileName);
  console.log(`Response from getting profile : ${JSON.stringify(r.data, null, 2)}`);
  const profileId = r.data._id;
  r = await releaseProfile(profileId);
  console.log(`Response from releasing profile : ${JSON.stringify(r.data, null, 2)}`);
}

main();
```

## Swagger Docs

First start the server then access  http://localhost:8080/docs/

  
\* The profile service is originally from https://github.com/azweb76/node-test-api/