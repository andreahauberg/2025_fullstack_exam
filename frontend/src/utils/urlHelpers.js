export const buildProfilePath = (
  user = {},
  { currentUser } = {}
) => {
  const { user_pk, user_username } = user;
  if (!user_username) return "#";
  const currentUserPk = currentUser?.user_pk;
  const currentUsername = currentUser?.user_username;
  const isCurrent =
    (currentUserPk && user_pk && String(user_pk) === String(currentUserPk)) ||
    (currentUsername && user_username === currentUsername);
  return isCurrent ? `/profile/${user_username}` : `/user/${user_username}`;
};
