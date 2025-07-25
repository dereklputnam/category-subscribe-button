# Category Subscribe Button

A Discourse theme component that adds configurable subscription buttons to category topics, allowing users to easily subscribe to news updates or watch security advisories.

## Features

- **Configurable Categories**: Select which categories show subscription buttons via dropdown settings
- **Two Notification Levels**: 
  - Subscribe button sets "Watching First Post" (level 4) for news categories
  - Watch All button sets "Watching" (level 3) for security categories  
- **Exception Handling**: Configure categories to show only their name instead of "Parent > Child" format
- **Responsive Design**: Mobile-friendly styling with modern UI components
- **Modern Architecture**: Consolidated code in head_tag.html for maximum compatibility

## Installation

1. Go to **Admin → Customize → Themes**
2. Click **"Install"**
3. Select **"From a git repository"**
4. Enter: `https://github.com/dereklputnam/category-subscribe-button.git`
5. Click **"Install"**

## Configuration

After installation, configure the theme in **Admin → Customize → Themes → Category Subscribe Button → Settings**:

- **Subscribe Categories**: Categories that show the "Subscribe" button (Watching First Post)
- **Subscribe Category Name Only Exceptions**: Categories that display only their name
- **Watching Categories**: Categories that show the "Watch All" button (Watching)
- **Watching Category Name Only Exceptions**: Categories that display only their name

## License

MIT License - see LICENSE file for details.