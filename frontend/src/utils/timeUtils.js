import moment from "moment";

export const formatRelativeTime = (date) => {
  if (!date) return "";
  const now = moment();
  // Parse backend timestamp as UTC then convert to local time to avoid timezone offsets
  const postDate = moment.utc(date).local();
  const diffInSeconds = now.diff(postDate, "seconds");
  const diffInMinutes = now.diff(postDate, "minutes");
  const diffInHours = now.diff(postDate, "hours");
  const diffInDays = now.diff(postDate, "days");

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays === 1) {
    return `1d`;
  } else if (diffInDays > 1 && diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return "more than a day ago";
  }
};

export default formatRelativeTime;
