
# AI Blog Scribe

AI Blog Scribe is an automated blog post generation system that creates trending blog posts using Google's Gemini AI and sends them via email through Mailfence SMTP.

## Features

- 🤖 **AI-Powered Content**: Uses Google Gemini AI to generate trending topics and comprehensive blog posts
- 📧 **Automated Email Delivery**: Sends generated content via Mailfence SMTP
- ⚡ **GitHub Actions Automation**: Runs automatically every 3 minutes (3-4 posts per 10 minutes)
- 🎨 **Beautiful Frontend**: Interactive web interface to manually generate and test content
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Demo

You can view and interact with the application at: [Your Lovable Project URL]

## How It Works

1. **Topic Generation**: AI analyzes current trends to suggest relevant blog topics
2. **Headline Creation**: Generates 5 engaging, SEO-friendly headlines for each topic
3. **Content Creation**: Writes comprehensive 1000-1200 word blog posts
4. **Image Integration**: Adds relevant placeholder images
5. **Email Delivery**: Sends formatted content via Mailfence SMTP

## GitHub Actions Setup

### Required Secrets

To enable automated blog generation, add these secrets to your GitHub repository:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIza...` |
| `MAILFENCE_EMAIL` | Your Mailfence email address | `your-email@mailfence.com` |
| `MAILFENCE_PASSWORD` | Your Mailfence password | `your-password` |
| `RECIPIENT_EMAIL` | Email to send blog posts to | `recipient@example.com` |

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it as `GEMINI_API_KEY` secret

### Mailfence Configuration

The automation uses these Mailfence SMTP settings:
- **SMTP Server**: smtp.mailfence.com
- **Port**: 465 (SSL/TLS)
- **Authentication**: Your Mailfence email and password

### Workflow Schedule

The GitHub Actions workflow (`/.github/workflows/main.yml`) runs:
- **Automatically**: Every 3 minutes via cron schedule
- **Manually**: Via workflow_dispatch trigger in GitHub Actions tab

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-blog-scribe
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install automation dependencies:
```bash
cd automation
npm install
cd ..
```

4. Start the development server:
```bash
npm run dev
```

### Testing the Automation Locally

1. Create a `.env` file in the `automation` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
MAILFENCE_EMAIL=your_mailfence_email
MAILFENCE_PASSWORD=your_mailfence_password
RECIPIENT_EMAIL=recipient_email
```

2. Run the automation script:
```bash
cd automation
node generate-blog.js
```

## Frontend Usage

1. **Configure API**: Enter your Gemini API key and email settings
2. **Generate Topics**: Click to get AI-generated trending topics
3. **Select Topic**: Choose from the generated topics
4. **Pick Headline**: Select your preferred headline
5. **Review & Send**: Review the generated blog post and send via email

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **AI**: Google Gemini 1.5 Flash
- **Email**: Mailfence SMTP with Nodemailer
- **Automation**: GitHub Actions, Node.js
- **Build Tool**: Vite

## Project Structure

```
ai-blog-scribe/
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actions workflow
├── automation/
│   ├── generate-blog.js      # Main automation script
│   └── package.json          # Automation dependencies
├── src/
│   ├── components/           # React components
│   ├── pages/               # Application pages
│   └── ...                  # Other frontend files
├── README.md
└── package.json             # Frontend dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues:

1. Check the GitHub Actions logs for automation errors
2. Verify your API keys and email credentials
3. Ensure all required secrets are properly set
4. Check the [Lovable documentation](https://docs.lovable.dev/) for additional help

## Acknowledgments

- Google Gemini AI for content generation
- Mailfence for reliable email delivery
- Lovable platform for rapid development
- Shadcn UI for beautiful components
