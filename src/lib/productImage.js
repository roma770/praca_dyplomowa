export const resolveProductImage = (image = '') => {
  if (/^https?:\/\//i.test(image)) return image;
  return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, '')}`;
};
