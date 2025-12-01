export const buildProfilePath = (
  user = {},
  currentUserPk = null,
  currentUsername = null
) => {
  const { user_pk, user_username } = user;
  if (!user_username) return "#";
  const isCurrent =
    (currentUserPk && user_pk && String(user_pk) === String(currentUserPk)) ||
    (currentUsername && user_username === currentUsername);
  return isCurrent ? `/profile/${user_username}` : `/user/${user_username}`;
};
