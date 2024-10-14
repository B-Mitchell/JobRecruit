import './globals.css'
import Navbar from './components/Navbar'
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

export const metadata = {
  title: 'Job Recruitment system',
  description: 'Built by Big Mitch',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body >
            <Navbar />
            <div className="user-container">
              {children}
            </div>
        </body>
      </html>
    </ClerkProvider>
  )
}

