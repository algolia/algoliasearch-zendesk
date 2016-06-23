import vi from 'vietnamese-stopwords/vietnamese-stopwords.txt';

export default vi.split('\n')
  .map(word => (word || '').trim())
  .filter(word => word !== false && word.length > 0);
