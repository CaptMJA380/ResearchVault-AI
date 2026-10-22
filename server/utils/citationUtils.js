/**
 * Generates clean BibTeX citation string from Paper document metadata.
 * Does not invent metadata.
 */
export function formatBibTeX(paper) {
  if (!paper || !paper.title) return '';

  const cleanTitle = paper.title.replace(/[\{\}]/g, '');
  const firstAuthor = Array.isArray(paper.authors) && paper.authors.length > 0 ? paper.authors[0] : 'Unknown';
  const authorKey = firstAuthor.split(/\s+/).pop()?.toLowerCase() || 'paper';
  const yearKey = paper.publicationYear || new Date().getFullYear();
  const citationKey = `${authorKey}${yearKey}${paper._id ? String(paper._id).slice(-4) : ''}`;

  const authorsString = Array.isArray(paper.authors) && paper.authors.length > 0
    ? paper.authors.join(' and ')
    : 'Unknown';

  const lines = [
    `@article{${citationKey},`,
    `  title = {${cleanTitle}},`,
    `  author = {${authorsString}},`,
  ];

  if (paper.publicationYear) {
    lines.push(`  year = {${paper.publicationYear}},`);
  }
  if (paper.journalOrVenue) {
    lines.push(`  journal = {${paper.journalOrVenue}},`);
  }
  if (paper.doi) {
    lines.push(`  doi = {${paper.doi}},`);
  }
  if (paper.abstract) {
    // Truncate long abstract in bibtex to avoid massive entries
    const safeAbstract = paper.abstract.slice(0, 500).replace(/[\{\}]/g, '');
    lines.push(`  abstract = {${safeAbstract}},`);
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Validates whether a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}
