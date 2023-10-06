import { Users } from "../entity/Users";
import { AppDataSource } from "../config/data-source";
import { requestResponse } from "../types";
export const addFriendship = async (
  user: Users,
  friend: Users
): Promise<requestResponse> => {
  const prevFriends = addFriendshipHelper(user, friend);
  if (!prevFriends) return { error: "Friendship already exists" };
  addFriendshipHelper(friend, user);

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(Users, user);
      await transactionalEntityManager.save(Users, friend);
    });
    return { success: true };
  } catch (err) {
    return { error: "Error while saving friendship" };
  }
};

const addFriendshipHelper = (user: Users, friend: Users) => {
  if (!user.friends) {
    user.friends = [friend];
  } else if (!user.friends.some((u) => u.id === friend.id)) {
    user.friends.push(friend);
  } else return false;
  return true;
};

export const deleteFriendship = async (
  user: Users,
  friend: Users
): Promise<requestResponse> => {
  if (user.friends && friend.friends) {
    user.friends = user.friends.filter((u) => u.id !== friend.id);
    friend.friends = friend.friends.filter((u) => u.id !== user.id);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(Users, user);
      await transactionalEntityManager.save(Users, friend);
    });
    return { success: true };
  } else {
    return { error: "Error while deleting friendship" };
  }
};
