import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { KnowledgeProvider } from './context/KnowledgeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <KnowledgeProvider>
        <App />
    </KnowledgeProvider>
) 