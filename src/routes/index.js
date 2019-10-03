import diagnostic from './diagnostic';
import profile from './profile';

function register(app) {
  diagnostic.register(app);
  profile.register(app);
}

export default {
  register
};
