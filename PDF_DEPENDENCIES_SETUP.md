# PDF Export Dependencies Setup

## Required Dependencies

To enable PDF export functionality, you need to install the following packages:

### 1. Install PDF Libraries
```bash
npm install jspdf html2canvas
```

### 2. Package Details

#### jsPDF
- **Purpose**: Generate PDF documents in JavaScript
- **Version**: ^2.5.1 or later
- **Documentation**: https://github.com/parallax/jsPDF

#### html2canvas
- **Purpose**: Convert HTML elements to canvas for PDF generation
- **Version**: ^1.4.1 or later
- **Documentation**: https://github.com/niklasvh/html2canvas

## Installation Steps

### Step 1: Navigate to Frontend Directory
```bash
cd mvms-frontend
```

### Step 2: Install Dependencies
```bash
npm install jspdf html2canvas
```

### Step 3: Verify Installation
Check that the packages are added to your `package.json`:
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    // ... other dependencies
  }
}
```

## Usage in Code

The PDF export functionality is already implemented in:
- `utils/pdfExport.js` - Main PDF generation logic
- `pages/organization/reports.js` - Integration with reports page
- `components/reports/ReportViewer.js` - Export button functionality

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Known Limitations
- ⚠️ Internet Explorer not supported
- ⚠️ Some mobile browsers may have limited functionality
- ⚠️ Large reports may take time to generate

## Troubleshooting

### Common Issues

#### 1. Module Not Found Error
```
Error: Cannot resolve module 'jspdf'
```
**Solution**: Ensure packages are installed correctly
```bash
npm install jspdf html2canvas
rm -rf node_modules package-lock.json
npm install
```

#### 2. Canvas Rendering Issues
```
Error: html2canvas failed to render
```
**Solution**: Check for CORS issues or complex CSS
- Ensure all images have proper CORS headers
- Simplify complex CSS animations
- Use `useCORS: true` option

#### 3. PDF Generation Slow
**Solution**: Optimize report content
- Limit number of items displayed
- Reduce image sizes
- Use lower canvas scale if needed

### Performance Tips

1. **Limit Report Size**: Show only essential data in PDF
2. **Optimize Images**: Compress images before rendering
3. **Use Pagination**: Break large reports into multiple pages
4. **Show Loading**: Display progress indicator during generation

## Alternative Solutions

If you encounter issues with jsPDF + html2canvas, consider these alternatives:

### 1. Server-side PDF Generation
- Generate PDFs on the backend using libraries like Puppeteer
- Send PDF URL to frontend for download
- Better for complex layouts and large datasets

### 2. Print-friendly CSS
- Create print-optimized CSS styles
- Use browser's native print-to-PDF functionality
- Simpler implementation but less control

### 3. Third-party Services
- Use services like PDFShift or HTML/CSS to PDF API
- Better reliability but requires external dependency
- May have usage limits or costs

## Testing PDF Export

### Manual Testing
1. Generate any report in the application
2. Click "Export PDF" button
3. Verify PDF downloads correctly
4. Check PDF content and formatting
5. Test printing the PDF

### Automated Testing
```javascript
// Example test for PDF export
test('should export report to PDF', async () => {
  // Mock the PDF export function
  const mockExport = jest.fn();
  
  // Render component with mock
  render(<ReportViewer onExportPDF={mockExport} />);
  
  // Click export button
  fireEvent.click(screen.getByText('Export PDF'));
  
  // Verify function was called
  expect(mockExport).toHaveBeenCalled();
});
```

## Security Considerations

### Content Security Policy (CSP)
If you have CSP enabled, you may need to allow:
```
script-src 'unsafe-eval' 'unsafe-inline';
img-src data: blob:;
```

### Data Privacy
- PDFs are generated client-side (no data sent to external servers)
- Ensure sensitive data is handled appropriately
- Consider adding watermarks for confidential reports

## Production Deployment

### Build Optimization
The PDF libraries are relatively large. Consider:
1. **Code Splitting**: Load PDF libraries only when needed
2. **Bundle Analysis**: Check impact on bundle size
3. **CDN Loading**: Load libraries from CDN if preferred

### Example Code Splitting
```javascript
// Lazy load PDF export functionality
const exportToPDF = async () => {
  const { exportReportToPDF } = await import('../utils/pdfExport');
  return exportReportToPDF(reportData, reportType);
};
```

## Support and Documentation

### Official Documentation
- [jsPDF Documentation](https://raw.githack.com/MrRio/jsPDF/master/docs/index.html)
- [html2canvas Documentation](https://html2canvas.hertzen.com/documentation)

### Community Resources
- [jsPDF Examples](https://github.com/parallax/jsPDF/tree/master/examples)
- [html2canvas Examples](https://html2canvas.hertzen.com/examples)

### Getting Help
If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed correctly
3. Test with a simple report first
4. Check GitHub issues for known problems

The PDF export functionality provides a professional way for organizations to save and share their reports in a standardized format.
