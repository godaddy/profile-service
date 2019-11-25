# Profile Service

The purpose of the profile service is to provide locked data to be used by the tests. This allows you to avoid concurrency issues. You store multiple profile entries (each gets their own profileId) meta data inside of the service (MongoDB backend), then when you run your test, you call the service which claims/locks one of those profile entries (profileId) so that another test can't use it. Each profile entry will automatically unlock after 10 minutes whether you explicitly unlock it or not.

You do not need to create a profile before adding entries to it. You simply need to add a profile entry to a specific profile name, and that profile entry will get added for that specific profile name.

If you do not explicitly release a profile entry, it will be released after 10 minutes automatically.

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
npm run start
```

## Profile Service Usage:

### Steps to use profile service
1) Add entry to profile ( POST /profile/{name} ) [See the 1st API request](#calling-the-profile-service-api)
2) In your test, when it runs, request a profile entry ( GET /profile/{name}/next ) [See the 2nd API request](#calling-the-profile-service-api)
3) At the end of your test, release the profile entry so another test can use it ( POST /profile/{id}/release ) [See the 3rd API request](#calling-the-profile-service-api)

### Calling the profile service API

Sample in javascript:

* First `npm install node-fetch`

``` javascript
const fetch = require('node-fetch');

const profileServiceUrl = 'http://localhost:8080';

// 1st API request - Add data to profile in the profile service.
// This will be done prior to your tests running.
// Each profileName can have multiple profileIds (entries)
async function addToProfile(profileName, profileData) {
  const res = await fetch(`${profileServiceUrl}/profile/${profileName}`, {
    method: 'POST',
    body: JSON.stringify(profileData),
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
}

// 2nd API request - Retrieves an object from the profile service.
// This will lock that profile so another test can not use it.
// Each profileName can have multiple profileIds (entries)
async function getProfile(profileName) {
  const res = await fetch(`${profileServiceUrl}/profile/${profileName}/next`);
  return await res.json();
}

// 3rd API request - Releases profile lock, so another test can get this profile.
// Each profileName can have multiple profileIds (entries)
async function releaseProfile(profileId) {
  const res = await fetch(`${profileServiceUrl}/profile/${profileId}/release`, {
    method: 'POST'
  });
  return await res.json();
}

async function main() {
  const profileName = 'test-profile';
  const profileData = {
    username: 'myTestUserName',
    password: 'myTestPassword1'
  };

  let r = await addToProfile(profileName, profileData);
  console.log(`Response from adding to profile : ${JSON.stringify(r, null, 2)}`);
  r = await getProfile(profileName);
  console.log(`Response from getting profile : ${JSON.stringify(r, null, 2)}`);
  const profileId = r._id;
  r = await releaseProfile(profileId);
  console.log(`Response from releasing profile : ${JSON.stringify(r, null, 2)}`);
}

main();
```

## Swagger Docs

First start the server then access  http://localhost:8080/docs/

  
\* The profile service is originally from https://github.com/azweb76/node-test-api/