export const getFileTypeFromUrl = (url) => {
  if (url === null || url === undefined) return "unknown";

  // Handle Firebase Storage URLs that might have parameters
  let urlToCheck = url;
  
  // If it's a Firebase Storage URL, check for alt parameter which contains the file path
  if (url.includes('firebasestorage.googleapis.com')) {
    try {
      const urlObj = new URL(url);
      const alt = urlObj.searchParams.get('alt');
      if (alt) {
        // Extract filename from the path
        const pathParts = urlObj.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        if (filename) {
          urlToCheck = filename;
        }
      }
    } catch (e) {
      // If URL parsing fails, continue with original logic
    }
  }

  // Extract extension from the URL or filename
  const extension = urlToCheck.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
      return "image";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "flv":
    case "webm":
      return "video";
    default:
      // For Firebase URLs, also check if the URL contains image indicators
      if (url.includes('firebasestorage.googleapis.com') && 
          (url.includes('post_') || url.includes('image') || url.includes('img'))) {
        // Assume it's an image if it's from Firebase and has image-like naming
        return "image";
      }
      return "unknown";
  }
};

export const updateQueryCacheLikes = (
  postLikes,
  postId,
  userId,
  actionType
) => {
  if (actionType === "like") {
    return [...postLikes, { authorId: userId, postId }];
  } else {
    return postLikes.filter((like) => like.authorId !== userId);
  }
};

export const checkPostForTrends = (postText = "") => {
  // 1. split post text into words that have hashtags
  const firstSplit = postText
    .trim()
    .split(/\s+/)
    .filter((word) => word.startsWith("#"))
    .map((word) => word.toLowerCase());
  let res = firstSplit;
  // 2. check if there are any words that have multiple hashtags
  firstSplit.map((word) => {
    const secondSplit = word.split("#");
    if (secondSplit.length > 1) {
      res = [...res, ...secondSplit.slice(1, secondSplit.length)].filter(
        (el) => el !== word
      );
    }
  });
  // if array contains same hashtags, remove duplicates
  res = [...new Set(res)];
  return res;
};
