const getFirstUrl = (urlArray, xMatch = false) => {
  for (const url of urlArray) {
    if (xMatch && url.size === xMatch) return url.url;
    if (!xMatch) return url.url;
  }
  return urlArray[0]?.url;
};

export default function Image({ code, urls }) {
  const src = getFirstUrl(urls, '1x');
  const srcSet = [
    getFirstUrl(urls, '1x') + ' 1x',
    getFirstUrl(urls, '2x') + ' 2x',
    getFirstUrl(urls, '3x') + ' 3x',
    getFirstUrl(urls, '4x') + ' 4x'
  ].join(', ');

  return (
    <img 
      alt={code}
      className="inline-block align-middle h-6"
      src={src}
      srcSet={srcSet}
    />
  );
}