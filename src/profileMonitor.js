import Profile from './models/profile';

function start({ unlockProfileMs }) {
  setInterval(() => {
    Profile.updateMany({
      locked: true,
      locked_dt: {
        $lt: (new Date() - unlockProfileMs)
      }
    }, {
      locked: false,
      locked_dt: null
    }, (err) => {
      if (err) return console.error(err); // eslint-disable-line no-console
    });
  }, 60000).unref();
}

export default {
  start
};
