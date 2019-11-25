const profileService = require('../../src/routes/profile');
const assert = require('assert');

describe('Profile Service', () => {
  let profileName;
  let username;
  let password;
  let req;
  let res;

  before(async () => {
    profileName = 'test-profile';
    username = 'test-user';
    password = 'testPassword1';
  });

  beforeEach(() => {
    req = {};
    res = {
      statusCode: '',
      json(json) {
        this.json = json;
      }
    };
  });

  it('[add] create new profile entry in service', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.name, profileName);
      assert.equal(res.json.locked, false);
      assert.equal(res.json.meta.username, username);
      assert.equal(res.json.meta.password, password);

      done();
    });
  });

  it('[add] create bulk new profile entries in service', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password }
    ];
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, 2);
      assert.notEqual(res.json[0]._id, res.json[1]._id);
      assert.equal(res.json[0].name, profileName);
      assert.equal(res.json[0].locked, false);
      assert.equal(res.json[0].meta.username, username);
      assert.equal(res.json[0].meta.password, password);

      assert.equal(res.json[1].name, profileName);
      assert.equal(res.json[1].locked, false);
      assert.equal(res.json[1].meta.username, username);
      assert.equal(res.json[1].meta.password, password);

      done();
    });
  });

  it('[getNext] get next profile entry in service returns the profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };

      profileService.getNext(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.username, username);
        assert.equal(res.json.password, password);

        req.params = { id: id };
        res.json = function (json) {
          this.json = json;
        };
        profileService.getOne(req, res, () => {
          assert.equal(res.json.locked, true);
          done();
        });
      });
    });
  });

  it('[getNext] get next profile entry when no results returns null', done => {
    req.params = { name: profileName };
    profileService.getNext(req, res, () => {
      assert.equal(res.statusCode, 404);
      assert.equal(res.json.message, 'Record not found!');
      done();
    });
  });

  it('[getOne] get single profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      req.params = { id: id };
      res.json = function (json) {
        this.json = json;
      };

      profileService.getOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.meta.username, username);
        assert.equal(res.json.meta.password, password);

        done();
      });
    });
  });

  it('[getAll] get all profile entries from specific profile without detail', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      res.json = function (json) {
        this.json = json;
      };

      profileService.getAll(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json[0].username, username);
        assert.equal(res.json[0].password, password);

        done();
      });
    });
  });

  it('[getAll] get all profile entries from specific profile with details', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;

      req.query = { detail: '1' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.getAll(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json[0].meta.username, username);
        assert.equal(res.json[0].meta.password, password);
        assert.equal(res.json[0].id, id);
        assert.equal(res.json[0].name, profileName);

        done();
      });
    });
  });

  it('[releaseOne] release the specific profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };

      profileService.getNext(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.username, username);
        assert.equal(res.json.password, password);

        req.params = { id: id };
        res.json = function (json) {
          this.json = json;
        };
        profileService.releaseOne(req, res, () => {
          assert.equal(res.statusCode, 200);

          res.json = function (json) {
            this.json = json;
          };

          profileService.getOne(req, res, () => {
            assert.equal(res.statusCode, 200);
            assert.equal(res.json.locked, false);
            assert.equal(res.json.locked_dt, null);
            assert.equal(res.json.use_cnt, 1);
            assert.equal(res.json.error_cnt, null);

            done();
          });
        });
      });
    });
  });

  it('[releaseOne] release the specific profile entry and mark it as an error', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };

      profileService.getNext(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.username, username);
        assert.equal(res.json.password, password);

        req.params = { id: id };
        req.query = { error: '1' };
        res.json = function (json) {
          this.json = json;
        };
        profileService.releaseOne(req, res, () => {
          assert.equal(res.statusCode, 200);

          res.json = function (json) {
            this.json = json;
          };

          profileService.getOne(req, res, () => {
            assert.equal(res.statusCode, 200);
            assert.equal(res.json.locked, false);
            assert.equal(res.json.locked_dt, null);
            assert.equal(res.json.error_cnt, 1);
            assert.equal(res.json.use_cnt, 1);

            done();
          });
        });
      });
    });
  });

  it('[releaseAll] release all profile entries', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };

      profileService.getNext(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.username, username);
        assert.equal(res.json.password, password);

        req.params = { name: profileName };
        res.json = function (json) {
          this.json = json;
        };
        profileService.releaseAll(req, res, () => {
          assert.equal(res.statusCode, 200);

          req.params = { id: id };
          res.json = function (json) {
            this.json = json;
          };

          profileService.getOne(req, res, () => {
            assert.equal(res.statusCode, 200);
            assert.equal(res.json.locked, false);
            assert.equal(res.json.locked_dt, null);

            done();
          });
        });
      });
    });
  });

  it('[updateOne] update one profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };
      req.params = { id: id };
      req.body = { username: 'new-username', password: 'new-password1' };

      profileService.updateOne(req, res, () => {
        assert.equal(res.statusCode, 201);

        res.json = function (json) {
          this.json = json;
        };

        profileService.getOne(req, res, () => {
          assert.equal(res.statusCode, 200);
          assert.equal(res.json.meta.username, 'new-username');
          assert.equal(res.json.meta.password, 'new-password1');

          done();
        });
      });
    });
  });

  it('[deleteOne] delete one profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id = res.json._id;
      res.json = function (json) {
        this.json = json;
      };
      req.params = { id: id };

      profileService.deleteOne(req, res, () => {
        assert.equal(res.statusCode, 200);

        res.json = function (json) {
          this.json = json;
        };

        profileService.getOne(req, res, () => {
          assert.equal(res.statusCode, 200);
          assert.equal(res.json, null);

          done();
        });
      });
    });
  });

  it('[deleteAll] delete all profile entries in profile', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password }
    ];
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      res.json = function (json) {
        this.json = json;
      };

      profileService.deleteAll(req, res, () => {
        assert.equal(res.statusCode, 200);

        res.json = function (json) {
          this.json = json;
        };

        profileService.getAll(req, res, () => {
          assert.equal(res.statusCode, 200);
          assert.equal(res.json.length, 0);

          done();
        });
      });
    });
  });

  it('[getBy] get single specific profile entry', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      req.params = { key: 'username', value: username };
      res.json = function (json) {
        this.json = json;
      };

      profileService.getBy(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.meta.username, username);
        assert.equal(res.json.meta.password, password);

        done();
      });
    });
  });

  it('[getBy] with key not found', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      req.params = { key: 'z', value: username };
      res.json = function (json) {
        this.json = json;
      };

      profileService.getBy(req, res, () => {
        assert.equal(res.statusCode, 404);
        assert.equal(res.json.message, 'Record not found!');

        done();
      });
    });
  });

  it('[getBy] with value not found', done => {
    req.params = { name: profileName };
    req.body = { username: username, password: password };
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      req.params = { key: 'username', value: 'z' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.getBy(req, res, () => {
        assert.equal(res.statusCode, 404);
        assert.equal(res.json.message, 'Record not found!');

        done();
      });
    });
  });

  it('[get] get all profile entries from all profiles without detail', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password }
    ];
    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      res.json = function (json) {
        this.json = json;
      };

      profileService.get(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.length, 2);
        assert.equal(res.json[0].username, username);
        assert.equal(res.json[0].password, password);
        assert.equal(res.json[0].name, null);
        assert.equal(res.json[0]._id, null);

        done();
      });
    });
  });

  it('[get] get all profile entries from all profiles with detail=id', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password }
    ];

    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      const id0 = res.json[0]._id;
      const id1 = res.json[1]._id;

      req.query = { detail: 'id' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.get(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.length, 2);
        const ids = res.json.map(id => id.toString());
        assert.equal(ids.indexOf(id0.toString()) > -1, true);
        assert.equal(ids.indexOf(id1.toString()) > -1, true);

        done();
      });
    });
  });

  it('[get] get all profile entries from all profiles with detail=1', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password }
    ];

    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);
      req.query = { detail: '1' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.get(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json[0].meta.username, username);
        assert.equal(res.json[0].meta.password, password);
        assert.notEqual(res.json[0]._id, null);
        assert.equal(res.json[0].name, profileName);

        assert.equal(res.json[1].meta.username, username);
        assert.equal(res.json[1].meta.password, password);
        assert.notEqual(res.json[1]._id, null);
        assert.equal(res.json[1].name, profileName);

        done();
      });
    });
  });

  it('[get] get all profile entries with test=1 when query.test=1', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password, test: '1' },
      { username: username, password: password, test: '2' }
    ];

    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);

      req.query = { test: '1' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.get(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.length, 1);
        assert.equal(res.json[0].username, username);
        assert.equal(res.json[0].password, password);
        assert.equal(res.json[0].test, '1');

        done();
      });
    });
  });

  it('[get] get all profile entries with test=1 when query.test=1 and query.detail=1', done => {
    req.params = { name: profileName };
    req.body = [
      { username: username, password: password },
      { username: username, password: password, test: '1' },
      { username: username, password: password, test: '2' }
    ];

    profileService.add(req, res, () => {
      assert.equal(res.statusCode, 200);

      req.query = { test: '1', detail: '1' };
      res.json = function (json) {
        this.json = json;
      };

      profileService.get(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.length, 1);
        assert.equal(res.json[0].meta.username, username);
        assert.equal(res.json[0].meta.password, password);
        assert.equal(res.json[0].meta.test, '1');

        done();
      });
    });
  });
});
