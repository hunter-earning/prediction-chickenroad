# Chicken Road Prediction Tool

A React application for prediction tools with connection modal functionality.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment to GitHub Pages

### Manual Deployment

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/chickenroad-tool",
   ```

2. Install the gh-pages package if not already installed:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Deploy the application:
   ```bash
   npm run deploy
   ```

### Automatic Deployment with GitHub Actions

This repository is configured with GitHub Actions for automatic deployment to GitHub Pages.

To set up automatic deployment:

1. Push your code to GitHub
2. Go to your repository settings
3. Navigate to Pages section
4. Under "Build and deployment" > "Source", select "GitHub Actions"
5. The workflow will automatically build and deploy your site when you push to the main branch

## Configuration

The application is configured to be deployed to GitHub Pages with the base URL `/chickenroad-tool/`. If you need to change this, update the `base` property in `vite.config.ts`.