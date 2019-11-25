/* eslint-disable valid-jsdoc */
const Profile = require('../models/profile');
const sanitize = require('mongo-sanitize');

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - Profiles
 *     description: Get all profile entries.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function get({ query }, res, cb) {
  let qCnt = 0;
  let f = {};
  let detail = false;
  if (query && query.detail) {
    detail = query.detail;
    delete query.detail;
  }
  let fields = null;
  if (detail === 'id') {
    fields = '_id';
  }
  for (const x in query) {
    if (Object.prototype.hasOwnProperty.call(query, x)) {
      qCnt++;
      if (x === 'locked') {
        f.locked = query.locked;
      } else {
        f[`meta.${x}`] = query[x];
      }
    }
  }
  if (qCnt === 0) {
    f = null;
  }
  Profile.find(f, fields, (err, profiles) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    if (detail === 'id') {
      const d = profiles.map(({ _id }) => _id);
      res.json(d);
      if (cb) return cb();
    } else if (detail) {
      res.statusCode = 200;
      res.json(profiles);
      if (cb) return cb();
    } else {
      const d = profiles.map(({ meta }) => meta);
      res.statusCode = 200;
      res.json(d);
      if (cb) return cb();
    }
  });
}

/**
 * @swagger
 * /profile/key/{key}/value/{value}:
 *   get:
 *     tags:
 *       - Profile Entries
 *     description: Get a particular profile entry by key and value.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: key
 *         description: The key of one of the data from profile.
 *         in: path
 *         required: true
 *         type: string
 *         example: "username"
 *       - name: value
 *         description: The value of key of one of the data from profile.
 *         in: path
 *         required: true
 *         type: string
 *         example: "my-username"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       404:
 *        description: A record was not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getBy({ params }, res, cb) {
  if (!params.key || !params.value) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (key or value).'
    });
    if (cb) return cb();
  }
  const key = `meta.${sanitize(params.key)}`;
  const value = sanitize(params.value);
  Profile.findOne({ [key]: value }, (err, profile) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    if (profile === null) {
      res.statusCode = 404;
      res.json({
        message: 'Record not found!'
      });
      if (cb) return cb();
    } else {
      res.statusCode = 200;
      res.json(profile);
      if (cb) return cb();
    }
  });
}

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     tags:
 *       - Profile Entries
 *     description: Get a particular profile entry by id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of one of the profile entries. Stored as _id in the object
 *         in: path
 *         required: true
 *         type: string
 *         example: "59764b5ac18f87ba0cd0bc9c"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getOne({ params }, res, cb) {
  if (!params.id) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (id).'
    });
    if (cb) return cb();
  }
  Profile.findById(sanitize(params.id), (err, profile) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(profile);
    if (cb) return cb();
  });
}

/**
 * @swagger
 * /profile/{name}/all?detail=1:
 *   get:
 *     tags:
 *       - Profiles
 *     description: Get All profile entries in a profile.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the profile from where you want to fetch the profile entries
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-profile"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getAll({ params, query }, res, cb) {
  if (!params.name) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (name).'
    });
    if (cb) return cb();
  }
  Profile.find({
    name: sanitize(params.name)
  }, (err, profiles) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    if (query && query.detail) {
      res.json(profiles);
      if (cb) return cb();
    } else {
      const d = profiles.map(({ meta }) => meta);
      res.json(d);
      if (cb) return cb();
    }
  });
}

/**
 * @swagger
 * /profile/{name}/next:
 *   get:
 *     tags:
 *       - Profiles
 *     description: Get Next unlocked entry in a profile.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the profile you want to get an entry from
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-profile"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       404:
 *        description: A record was not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getNext({ params }, res, cb) {
  if (!params.name) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (name).'
    });
    if (cb) return cb();
  }
  Profile.findOneAndUpdate({
    name: sanitize(params.name),
    locked: false
  }, {
    locked: true,
    locked_dt: new Date()
  }, {}, (updateErr, result) => {
    if (updateErr) {
      res.statusCode = 500;
      res.json({
        error: updateErr
      });
      if (cb) return cb();
    }
    if (result) {
      const r = Object.assign({}, result.meta);
      r._id = result._id;
      res.statusCode = 200;
      res.json(r);
      if (cb) return cb();
    } else {
      res.statusCode = 404;
      res.json({
        message: 'Record not found!'
      });
      if (cb) return cb();
    }
  });
}

/**
 * @swagger
 * /profile/{id}/release:
 *   post:
 *     tags:
 *       - Profile Entries
 *     description: Release/Unlock a particular profile entry by id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of one of the profile entries. Stored as _id in the object
 *         in: path
 *         required: true
 *         type: string
 *         example: "59764b5ac18f87ba0cd0bc9c"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function releaseOne({ query, params }, res, cb) {
  if (!params.id) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (id).'
    });
    if (cb) return cb();
  }
  const d = {
    locked: false,
    locked_dt: null
  };

  if (query && query.error) {
    d.$inc = {
      error_cnt: 1,
      use_cnt: 1
    };
  } else {
    d.$inc = {
      use_cnt: 1
    };
  }

  Profile.findByIdAndUpdate(sanitize(params.id), d, {}, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.json(result);
    if (cb) return cb();
  });
}

/**
 * @swagger
 * /profile/{id}:
 *   delete:
 *     tags:
 *       - Profile Entries
 *     description: Delete a particular profile entry by id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of one of the profile entries. Stored as _id in the object
 *         in: path
 *         required: true
 *         type: string
 *         example: "59764b5ac18f87ba0cd0bc9c"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function deleteOne({ params }, res, cb) {
  if (!params.id) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (id).'
    });
    if (cb) return cb();
  }
  Profile.findByIdAndRemove(sanitize(params.id), (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(result);
    if (cb) return cb();
  });
}


/**
 * @swagger
 * /profile/{name}/deleteAll:
 *   delete:
 *     tags:
 *       - Profiles
 *     description: Delete all profile entries in a profile.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the profile for which you want to delete profile entries
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-profile"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function deleteAll({ params }, res, cb) {
  if (!params.name) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (name).'
    });
    if (cb) return cb();
  }
  Profile.deleteMany({
    name: sanitize(params.name)
  }, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(result);
    if (cb) return cb();
  });
}

/**
 * @swagger
 * /profile/{name}/releaseAll:
 *   post:
 *     tags:
 *       - Profiles
 *     description: Release/Unlock all profile entries in a profile.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the profile for which you want to unlock profile entries
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-profile"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function releaseAll({ params }, res, cb) {
  if (!params.name) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (name).'
    });
    if (cb) return cb();
  }
  Profile.updateMany({
    name: sanitize(params.name),
    locked: true
  }, {
    locked: false,
    locked_dt: null
  }, (err, results) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(results);
    if (cb) return cb();
  });
}

/**
 * @swagger
 * /profile/{name}:
 *   post:
 *     tags:
 *       - Profiles
 *     description: Add a new profile entry into the profile.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the profile for which you want to add new entries, could be one JSON object or an array of JSON objects
 *         in: path
 *         required: true
 *       - name: payload
 *         description: Payload to add new entry in profile service for a profile
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             environment:
 *               type: string
 *     responses:
 *       201:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided or the payload sent is incorrect.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function add(req, res, cb) {
  if (!req.params.name) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (name).'
    });
    if (cb) return cb();
  }
  if (Array.isArray(sanitize(req.body))) {
    addBulk(req, res, cb);
  } else {
    addOne(req, res, cb);
  }
}

function addOne({ params, body }, res, cb) {
  const profile = new Profile({
    name: sanitize(params.name),
    locked: false,
    meta: sanitize(body)
  });
  profile.save((err, savedProfile) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(savedProfile);
    if (cb) return cb();
  });
}

function addBulk({ body, params }, res, cb) {
  const d = sanitize(body).map(i => ({
    name: sanitize(params.name),
    locked: false,
    meta: i
  }));
  Profile.create(d, (err, profiles) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 200;
    res.json(profiles);
    if (cb) return cb();
  });
}

/**
 * @swagger
 * /profile/{id}:
 *   patch:
 *     tags:
 *       - Profile Entries
 *     description: Update a particular profile entry by id.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: The id of one of the profile entries. Stored as _id in the object. *note - use full object, single line edits would replace profile entry with just that line*
 *         in: path
 *         required: true
 *       - name: payload
 *         description: payload to update data in profile service
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - id
 *           properties:
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             environment:
 *               type: string
 *     responses:
 *       201:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided or the payload sent is incorrect.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function updateOne({ body, params }, res, cb) {
  if (!params.id) {
    res.statusCode = 400;
    res.json({
      message: 'Required fields missing (id).'
    });
    if (cb) return cb();
  }
  const d = { meta: sanitize(body) };
  Profile.findOneAndUpdate({
    _id: sanitize(params.id)
  }, d, (err, profile) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
      if (cb) return cb();
    }
    res.statusCode = 201;
    res.json(profile);
    if (cb) return cb();
  });
}


function register(app) {
  app.get('/profile/', get);
  app.get('/profile/key/:key/value/:value', getBy);
  app.post('/profile/:name', add);
  app.get('/profile/:id', getOne);
  app.get('/profile/:name/next', getNext);
  app.get('/profile/:name/all', getAll);
  app.post('/profile/:id/release', releaseOne);
  app.patch('/profile/:id', updateOne);
  app.post('/profile/:name/releaseAll', releaseAll);
  app.delete('/profile/:id', deleteOne);
  app.delete('/profile/:name/deleteAll', deleteAll);
}

module.exports = {
  register,
  add,
  get,
  getOne,
  getNext,
  getAll,
  getBy,
  releaseAll,
  releaseOne,
  updateOne,
  deleteOne,
  deleteAll
};
