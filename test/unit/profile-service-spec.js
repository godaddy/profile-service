const request = require('supertest');
const assert = require('assert');
const { app } = require('../../src/app');
const Profile = require('../../src/models/profile');

const profileName = 'test-profile';
const username = 'test-user';
const password = 'testPassword1';

describe('Profile Service', () => {
  it('[add] create new profile entry in service', async () => {
    const data = {
      username: username,
      password: password
    };
    const response = await request(app)
      .post(`/profile/${profileName}`)
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.name, profileName);
    assert.equal(body.locked, false);
    assert.equal(body.meta.username, username);
    assert.equal(body.meta.password, password);
  });

  it('[add] create bulk new profile entries in service', async () => {
    const data = [
      {
        username: username,
        password: password
      },
      {
        username: username,
        password: password
      }
    ];
    const response = await request(app)
      .post(`/profile/${profileName}`)
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.length, 2);
    assert.notEqual(body[0]._id, body[1]._id);
    assert.equal(body[0].name, profileName);
    assert.equal(body[0].locked, false);
    assert.equal(body[0].meta.username, username);
    assert.equal(body[0].meta.password, password);

    assert.equal(body[1].name, profileName);
    assert.equal(body[1].locked, false);
    assert.equal(body[1].meta.username, username);
    assert.equal(body[1].meta.password, password);
  });

  it('[getNext] get next profile entry in service returns the profile entry', async () => {
    await addProfileEntry();

    let response = await request(app)
      .get(`/profile/${profileName}/next`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    let body = JSON.parse(response.text);
    const profileEntryId = body._id;

    assert.equal(body.username, username);
    assert.equal(body.password, password);

    response = await request(app)
      .get(`/profile/${profileEntryId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    body = JSON.parse(response.text);

    assert.equal(body.locked, true);
  });

  it('[getNext] get next profile entry when no results returns null', async () => {
    const response = await request(app)
      .get(`/profile/${profileName}/next`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
    const body = JSON.parse(response.text);

    assert.equal(body.message, 'Record not found!');
  });

  it('[getOne] get single profile entry', async () => {
    const profileEntryId = await addProfileEntry();

    const response = await request(app)
      .get(`/profile/${profileEntryId}/`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.meta.username, username);
    assert.equal(body.meta.password, password);
  });

  it('[getAll] get all profile entries from specific profile without detail', async () => {
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile/${profileName}/all`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body[0].username, username);
    assert.equal(body[0].password, password);
  });

  it('[getAll] get all profile entries from specific profile with details', async () => {
    const profileEntryId = await addProfileEntry();

    const response = await request(app)
      .get(`/profile/${profileName}/all?detail=1`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body[0].meta.username, username);
    assert.equal(body[0].meta.password, password);
    assert.equal(body[0]._id, profileEntryId);
    assert.equal(body[0].name, profileName);
  });

  it('[releaseOne] release the specific profile entry', async () => {
    const profileEntryId = await addProfileEntry(true);

    await request(app)
      .post(`/profile/${profileEntryId}/release`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const profileEntry = await Profile.findById(profileEntryId);

    assert.equal(profileEntry.locked, false);
    assert.equal(profileEntry.locked_dt, null);
    assert.equal(profileEntry.use_cnt, 1);
    assert.equal(profileEntry.error_cnt, null);
  });

  it('[releaseOne] release the specific profile entry and mark it as an error', async () => {
    const profileEntryId = await addProfileEntry(true);

    await request(app)
      .post(`/profile/${profileEntryId}/release?error=1`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const profileEntry = await Profile.findById(profileEntryId);

    assert.equal(profileEntry.locked, false);
    assert.equal(profileEntry.locked_dt, null);
    assert.equal(profileEntry.use_cnt, 1);
    assert.equal(profileEntry.error_cnt, 1);
  });

  it('[releaseAll] release all profile entries', async () => {
    const profileEntryId = await addProfileEntry(true);

    await request(app)
      .post(`/profile/${profileName}/releaseAll`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const profileEntry = await Profile.findById(profileEntryId);

    assert.equal(profileEntry.locked, false);
    assert.equal(profileEntry.locked_dt, null);
  });

  it('[updateOne] update one profile entry', async () => {
    const profileEntryId = await addProfileEntry();

    const data = {
      username: 'new-username',
      password: 'new-password1'
    };

    await request(app)
      .patch(`/profile/${profileEntryId}`)
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201);

    const profileEntry = await Profile.findById(profileEntryId);
    assert.equal(profileEntry.meta.username, 'new-username');
    assert.equal(profileEntry.meta.password, 'new-password1');
  });

  it('[deleteOne] delete one profile entry', async () => {
    const profileEntryId = await addProfileEntry();

    await request(app)
      .delete(`/profile/${profileEntryId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const profileEntry = await Profile.findById(profileEntryId);
    assert.equal(profileEntry, null);
  });

  it('[deleteAll] delete all profile entries in profile', async () => {
    await addProfileEntry();
    await addProfileEntry();

    await request(app)
      .delete(`/profile/${profileName}/deleteAll`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const profiles = await Profile.find({ name: profileName });
    assert.equal(profiles.length, 0);
  });

  it('[getBy] get single specific profile entry', async () => {
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile/key/username/value/${username}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.meta.username, username);
    assert.equal(body.meta.password, password);
  });

  it('[getBy] with key not found', async () => {
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile/key/z/value/${username}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
    const body = JSON.parse(response.text);
    assert.equal(body.message, 'Record not found!');
  });

  it('[getBy] with value not found', async () => {
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile/key/username/value/z`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
    const body = JSON.parse(response.text);
    assert.equal(body.message, 'Record not found!');
  });

  it('[get] get all profile entries from all profiles without detail', async () => {
    await addProfileEntry();
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.length, 2);
    assert.equal(body[0].username, username);
    assert.equal(body[0].password, password);
    assert.equal(body[0].name, null);
    assert.equal(body[0]._id, null);
  });

  it('[get] get all profile entries from all profiles with detail=id', async () => {
    const profileEntryId0 = await addProfileEntry();
    const profileEntryId1 = await addProfileEntry();

    const response = await request(app)
      .get(`/profile?detail=id`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.length, 2);
    const ids = body.map(id => id.toString());
    assert.equal(ids.indexOf(profileEntryId0.toString()) > -1, true);
    assert.equal(ids.indexOf(profileEntryId1.toString()) > -1, true);
  });

  it('[get] get all profile entries from all profiles with detail=1', async () => {
    await addProfileEntry();
    await addProfileEntry();

    const response = await request(app)
      .get(`/profile?detail=1`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);

    assert.equal(body.length, 2);
    assert.equal(body[0].meta.username, username);
    assert.equal(body[0].meta.password, password);
    assert.notEqual(body[0]._id, null);
    assert.equal(body[0].name, profileName);

    assert.equal(body[1].meta.username, username);
    assert.equal(body[1].meta.password, password);
    assert.notEqual(body[1]._id, null);
    assert.equal(body[1].name, profileName);
  });

  it('[get] get all profile entries with test=1 when query.test=1', async () => {
    await addProfileEntry(false, { username: username, password: password });
    await addProfileEntry(false, { username: username, password: password, test: '1' });
    await addProfileEntry(false, { username: username, password: password, test: '2' });

    const response = await request(app)
      .get(`/profile?test=1`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);
    assert.equal(body.length, 1);
    assert.equal(body[0].username, username);
    assert.equal(body[0].password, password);
    assert.equal(body[0].test, '1');
  });

  it('[get] get all profile entries with test=1 when query.test=1 and query.detail=1', async () => {
    await addProfileEntry(false, { username: username, password: password });
    await addProfileEntry(false, { username: username, password: password, test: '1' });
    await addProfileEntry(false, { username: username, password: password, test: '2' });

    const response = await request(app)
      .get(`/profile?test=1&detail=1`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    const body = JSON.parse(response.text);
    assert.equal(body.length, 1);
    assert.equal(body[0].meta.username, username);
    assert.equal(body[0].meta.password, password);
    assert.equal(body[0].meta.test, '1');
  });
});

async function addProfileEntry(isLocked = false, data = { username: username, password: password }) {
  const profile = new Profile({
    name: profileName,
    locked: isLocked,
    meta: data
  });
  try {
    const p = await profile.save();
    return p._id;
  } catch (err) {
    console.log(`Unable to save profile entry : ${err}`);
    throw err;
  }
}
