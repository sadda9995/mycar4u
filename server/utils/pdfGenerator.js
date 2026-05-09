const html_to_pdf = require('html-pdf-node');

/**
 * Generate a PDF buffer from HTML
 * @param {string} html - The HTML content to convert
 * @returns {Promise<Buffer>} - The PDF buffer
 */
const generatePdf = async (html) => {
    try {
        const file = { content: html };
        const options = { format: 'A4', printBackground: true };
        
        // This returns a promise that resolves to a buffer
        const buffer = await html_to_pdf.generatePdf(file, options);
        return buffer;
    } catch (err) {
        console.error('PDF Generation failed:', err.message);
        throw err;
    }
};

module.exports = { generatePdf };
