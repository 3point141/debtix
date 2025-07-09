# Loan Visualizer - Interactive Amortization Calculator

A modern, interactive web application for visualizing loan amortization schedules, understanding interest vs principal payments, and simulating various payment scenarios.

## 🚀 Features

### Core Functionality
- **Interactive Loan Calculator**: Real-time amortization calculations
- **Visual Charts**: Area charts showing principal vs interest over time
- **Payment Breakdown**: Pie charts displaying payment composition
- **Payment Schedule**: Detailed table with search and pagination
- **Scenario Management**: Save and compare different loan scenarios

### Advanced Features
- **Extra Payments**: Add lump sum payments at any point
- **Rate Changes**: Model variable interest rate scenarios
- **Payment Frequency**: Monthly, bi-weekly, and weekly options
- **Real-time Updates**: Instant recalculation on parameter changes
- **Dark/Light Theme**: Toggle between themes with system preference detection

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Persistence**: Local storage for saving scenarios and preferences

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── charts/           # Chart components (Recharts)
│   │   ├── AmortizationChart.tsx
│   │   └── PaymentBreakdownChart.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainContent.tsx
│   └── ui/               # Reusable UI components
│       ├── SummaryCards.tsx
│       └── PaymentScheduleTable.tsx
├── hooks/                # Custom React hooks
│   └── useTheme.ts
├── store/                # State management (Zustand)
│   └── loanStore.ts
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── calculations.ts   # Loan calculation engine
│   └── formatters.ts     # Formatting utilities
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 🧮 Calculation Engine

The application uses precise financial formulas for accurate amortization calculations:

### Key Functions
- `calculateMonthlyPayment()`: Standard amortization formula
- `generateAmortizationSchedule()`: Complete payment schedule generation
- `applyExtraPayment()`: Recalculate with additional payments
- `calculateSavings()`: Compare scenarios and calculate savings

### Mathematical Accuracy
- All calculations use precise decimal arithmetic
- Rounded to 2 decimal places to avoid floating-point errors
- Validates input parameters for data integrity

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) for positive actions
- **Success**: Green (#22c55e) for completed states
- **Warning**: Orange (#f59e0b) for attention
- **Danger**: Red (#ef4444) for errors/interest

### Typography
- **Font**: Inter (system fallback)
- **Responsive**: Scales appropriately across devices

### Components
- **Cards**: Consistent styling with hover effects
- **Buttons**: Primary and secondary variants
- **Forms**: Accessible input fields with validation
- **Tables**: Sortable with search and pagination

## 📊 Charts and Visualizations

### Amortization Chart
- **Type**: Stacked area chart
- **Data**: Principal vs Interest over time
- **Features**: Interactive tooltips, responsive design
- **Sampling**: Yearly data points to prevent overcrowding

### Payment Breakdown Chart
- **Type**: Donut chart
- **Data**: Total principal vs interest composition
- **Features**: Custom tooltips, percentage display
- **Summary**: Key metrics below chart

## 🔧 Configuration

### Environment Variables
Create a `.env` file for custom configuration:
```env
VITE_APP_TITLE=Loan Visualizer
VITE_DEFAULT_CURRENCY=USD
```

### Build Options
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Testing
npm run test
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Vercel will auto-detect Vite configuration
3. Deploy with zero configuration

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure redirects for SPA routing

### Static Hosting
1. Run `npm run build`
2. Upload `dist` folder to your hosting provider
3. Configure server for SPA routing

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test -- --watch
```

## 📈 Performance

### Optimizations
- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Unused code elimination
- **Memoization**: Expensive calculations cached
- **Virtualization**: Large tables optimized
- **Lazy Loading**: Chart components loaded on demand

### Bundle Analysis
```bash
npm run build
npx vite-bundle-analyzer dist
```

## 🔒 Security

- **Input Validation**: All user inputs validated
- **XSS Protection**: React's built-in protection
- **CSRF Protection**: Not applicable (static app)
- **Content Security Policy**: Configured in production

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: Graceful degradation for older browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Maintain consistent code formatting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Recharts**: Beautiful chart library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Zustand**: Lightweight state management
- **Lucide**: Beautiful icon library

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Check the documentation
- Review existing discussions

---

**Built with ❤️ using modern web technologies**