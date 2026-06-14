import './globals.css';

export const metadata = {
  title: 'AI Customer Support Chatbot',
  description: 'Production-ready AI chatbot for e-commerce - Deploy to Railway',
  openGraph: {
    title: 'AI Customer Support Chatbot',
    description: 'Deploy an AI chatbot in seconds',
    url: 'https://chatbot-template.railway.app',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
