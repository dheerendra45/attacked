# Attacked.ai BFI Frontend

A modern, responsive frontend for the Attacked.ai Briefing Intelligence platform. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Dashboard**: Quick overview with stats, recent briefings, and quick upload
- **Upload**: File upload and URL-based video processing with real-time job polling
- **Briefings**: Browse and filter all briefings with advanced search
- **Briefing Details**: Comprehensive analysis view with scores, highlights, and volatility
- **Slices**: Detailed slice-level analysis with transcript search and filtering
- **Settings**: Configurable polling intervals and theme preferences
- **Dark Mode**: Full dark/light/system theme support
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Attacked.ai BFI API running on `http://localhost:8000`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bfi-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build static files
npm run build

# Preview production build locally
npm run preview
```

### Integration with BFI API

After building, copy the contents of the `dist/` directory to the API's static files directory:

```bash
# Build the frontend
npm run build

# Copy to API static directory (adjust path as needed)
cp -r dist/* ../services/api/static/
```

The FastAPI backend serves the static files at the root path, so the SPA will be available at `http://localhost:8000/`.

## Architecture

### Project Structure

```
src/
├── api/           # API client and HTTP utilities
├── components/    # Reusable UI components
│   └── Layout/    # Layout components (Header, Sidebar)
├── hooks/         # Custom React hooks
├── pages/         # Page components and routing
├── types/         # TypeScript type definitions
├── styles/        # Global styles and Tailwind config
└── utils/         # Utility functions
```

### Key Components

- **API Client** (`src/api/client.ts`): Typed HTTP client for all backend interactions
- **Job Polling** (`src/hooks/useJobPolling.ts`): Real-time job status updates
- **Theme System** (`src/hooks/useTheme.ts`): Dark/light mode with system preference detection
- **Layout System**: Responsive sidebar navigation with collapsible design

### Data Flow

1. **Upload**: File/URL → Job Creation → Polling → Briefing Creation
2. **Analysis**: Briefing → Scores & Highlights → Slice-level Details
3. **Filtering**: Client-side filtering for briefings and slices
4. **Export**: JSON export functionality for briefings and slices

## API Integration

The frontend integrates with the following API endpoints:

- `GET /v1/health` - API health check
- `POST /v1/jobs` - Create processing job (file upload or URL)
- `GET /v1/jobs/{id}` - Job status and progress
- `GET /v1/briefings` - List all briefings
- `GET /v1/briefings/{id}` - Briefing details with scores
- `GET /v1/briefings/{id}/slices` - Detailed slice analysis

All API responses are fully typed with TypeScript interfaces that match the backend models.

## Configuration

### Environment Variables

The app uses these environment variables (optional):

```bash
# API base URL (defaults to http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000

# Enable debug mode
VITE_DEBUG=false
```

### Settings

User preferences are stored in localStorage:

- **Theme**: Light/Dark/System preference
- **Polling Interval**: Job status check frequency (1-10 seconds)
- **API Base URL**: Backend endpoint (read-only in UI)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lazy Loading**: Routes are code-split for optimal loading
- **Polling**: Configurable intervals to balance responsiveness and server load
- **Caching**: Recent API responses cached in memory
- **Virtualization**: Large slice lists are virtualized for performance

## Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **High Contrast**: Sufficient color contrast in both themes
- **Focus Management**: Clear focus indicators and logical tab order

## Security

- **XSS Protection**: All user content is properly escaped
- **CSRF**: Not applicable (no authentication/sessions)
- **Content Security Policy**: Compatible with CSP headers
- **No Sensitive Data**: All data is processed server-side

## Troubleshooting

### Common Issues

**API Connection Failed**
- Check that the BFI API is running on `http://localhost:8000`
- Verify CORS is configured properly on the backend
- Check browser network tab for detailed error messages

**Upload Not Working**
- Ensure file size is under the API limit
- Check file format is supported (MP4, MOV, MKV)
- Verify backend has sufficient disk space

**Dark Mode Issues**
- Clear localStorage and refresh
- Check system theme preference
- Ensure browser supports `prefers-color-scheme`

**Performance Issues**
- Increase polling interval in Settings
- Clear browser cache
- Check for memory leaks in browser dev tools

### Getting Help

1. Check browser console for errors
2. Review API documentation at `http://localhost:8000/docs`
3. Verify API health at `http://localhost:8000/v1/health`
4. Check GitHub issues for known problems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure linting and type checking pass
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write accessible HTML
- Include JSDoc comments for public APIs

## License

[License information to be added]

## Changelog

### v1.0.0
- Initial release with full BFI integration
- Dashboard, Upload, Briefings, and Analysis pages
- Dark mode support
- Responsive design
- Accessibility compliance