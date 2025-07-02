import { proxy } from 'valtio';
import { UserFragment } from 'app/graphql/operations/user/user.fragment.generated';

class UserStore {
  user: UserFragment | null = null;
}

export const userStore = proxy(new UserStore());
