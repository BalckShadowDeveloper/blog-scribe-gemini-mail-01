

# AI Blog Scribe

AI Blog Scribe is an automated blog post generation system that creates trending blog posts using Google's Gemini AI and sends them via email through Gmail SMTP.

## Features

- 🤖 **AI-Powered Content**: Uses Google Gemini AI to generate trending topics and comprehensive blog posts
- 📧 **Automated Email Delivery**: Sends generated content via Gmail SMTP
- ⚡ **GitHub Actions Automation**: Runs automatically every 5 minutes
- 🎨 **Beautiful Frontend**: Interactive web interface to manually generate and test content
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Demo

You can view and interact with the application at: [Your Lovable Project URL]

## How It Works

1. **Topic Generation**: AI analyzes current trends to suggest relevant blog topics
2. **Headline Creation**: Generates 5 engaging, SEO-friendly headlines for each topic
3. **Content Creation**: Writes comprehensive 1000-1200 word blog posts
4. **Image Integration**: Adds relevant placeholder images
5. **Email Delivery**: Sends formatted content via Gmail SMTP

## GitHub Actions Setup

### Required Secrets

To enable automated blog generation, add these secrets to your GitHub repository:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIza...` |
| `GMAIL_EMAIL` | Your Gmail email address | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Your Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `RECIPIENT_EMAIL` | Email to send blog posts to | `recipient@example.com` |

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it as `GEMINI_API_KEY` secret

### Gmail Configuration

**Important**: You need to use Gmail App Passwords, not your regular Gmail password.

1. **Enable 2-Factor Authentication** on your Gmail account (required for App Passwords)
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Google will generate a 16-character password
   - Use this App Password as `GMAIL_APP_PASSWORD` secret

The automation uses these Gmail SMTP settings:
- **Service**: Gmail (handled automatically by nodemailer)
- **Authentication**: Your Gmail email and App Password

### Workflow Schedule

The GitHub Actions workflow (`/.github/workflows/main.yml`) runs:
- **Automatically**: Every 5 minutes via cron schedule
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
GMAIL_EMAIL=your_gmail_email
GMAIL_APP_PASSWORD=your_gmail_app_password
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
- **Email**: Gmail SMTP with Nodemailer
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

## Troubleshooting Gmail Setup

If you're having issues with Gmail authentication:

1. **Verify 2FA is enabled** on your Google account
2. **Use App Password**, not your regular password
3. **Check Gmail security settings** - ensure "Less secure app access" is not blocking the connection
4. **Try generating a new App Password** if the current one isn't working

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
2. Verify your API keys and Gmail App Password
3. Ensure all required secrets are properly set
4. Check Gmail 2FA and App Password configuration
5. Check the [Lovable documentation](https://docs.lovable.dev/) for additional help

## Acknowledgments

- Google Gemini AI for content generation
- Gmail for reliable email delivery
- Lovable platform for rapid development
- Shadcn UI for beautiful components

