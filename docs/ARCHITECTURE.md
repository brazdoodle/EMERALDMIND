# EmeraldMind Architecture Documentation

## Overview

EmeraldMind is a comprehensive Pokemon ROM hacking toolkit built with React and modern web technologies. The application provides AI-assisted generation of trainers, scripts, and content for Pokemon Emerald ROM modifications, with a focus on authenticity, user experience, and developer productivity.

## Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality component library
- **React Router**: Client-side routing

### Backend/Services
- **Local Storage**: Data persistence layer
- **Ollama Integration**: Local LLM processing
- **File System API**: Project and asset management
- **Service Workers**: Offline capability and caching

### Development Tools
- **ESLint**: Code quality and style enforcement
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **VS Code**: Primary development environment

## Project Structure

```
src/
├── api/                    # API integration and data services
│   ├── entities.js         # Core data models (Trainer, Script, Flag)
│   ├── integrations.js     # AI/LLM integration layer
│   └── ollamaClient.js     # Ollama client implementation
├── components/             # Reusable UI components  
│   ├── dashboard/          # Dashboard-specific components
│   ├── shared/             # Common components across app
│   ├── trainer/            # Trainer generation components
│   └── scriptsage/         # Script generation components
├── contexts/               # React context providers
├── data/                   # Static data and Pokemon information
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and services
│   ├── consistency/        # AI consistency system
│   ├── scriptGenerator.js  # Script generation orchestration
│   └── hmaScriptGenerator.js # HMA-specific script logic
├── pages/                  # Top-level page components
├── services/               # Business logic services
│   ├── Gen3TeamGenerator.js    # Pokemon team generation
│   ├── ImprovedTeamGenerator.js # Enhanced team generation
│   └── PokemonService.js       # Pokemon data management
└── utils/                  # Helper utilities and functions
```

## Core Architecture Patterns

### Component Architecture

#### PageShell Pattern
All major pages use the standardized PageShell component:
```jsx
<PageShell
  title="Trainer Architect"
  description="Generate authentic Pokemon trainers"
  icon={Users}
  actions={[/* action buttons */]}
  statusIndicator={<StatusIndicator />}
  stats={[/* stats display */]}
>
  <PageCard title="Generation Options">
    {/* page content */}
  </PageCard>
</PageShell>
```

#### Service Layer Pattern
Business logic is separated into focused service classes:
```javascript
class PokemonService {
  static getPokemonDetails(identifier) { /* implementation */ }
  static getEvolutionChain(pokemon) { /* implementation */ }
  static validateTeamComposition(team) { /* implementation */ }
}
```

#### Hook Pattern
Complex state management is encapsulated in custom hooks:
```javascript
const useTrainerGeneration = (config) => {
  const [state, setState] = useState(initialState);
  const generate = useCallback(async (params) => {
    // generation logic
  }, []);
  return { state, generate, isLoading, error };
};
```

### Data Flow Architecture

#### 1. User Input Layer
- React components capture user preferences
- Forms validate input and provide real-time feedback
- Configuration state managed through React state/contexts

#### 2. Service Layer
- Business logic services process user input
- Services coordinate between data sources and AI systems
- Validation and error handling at service boundaries

#### 3. AI Integration Layer
- Consistent interface through InvokeLLM function
- AI Consistency System ensures reliable outputs
- Model adapters handle provider-specific optimizations

#### 4. Data Persistence Layer
- Local storage for project data and user preferences
- File system integration for import/export capabilities
- Caching layer for performance optimization

## AI Integration Architecture

### InvokeLLM Interface
Central AI integration point with consistency guarantees:
```javascript
const result = await InvokeLLM({
  prompt: userRequest,
  model: selectedModel,
  response_json_schema: expectedSchema,
  consistency_level: CONSISTENCY_LEVELS.BALANCED,
  task_type: 'trainer',
  max_attempts: 2
});
```

### Consistency System
Four-layer consistency architecture:
1. **ModelAdapters**: Provider-specific optimizations
2. **OutputValidators**: Format validation and repair
3. **ConsistencyRules**: Domain-specific validation
4. **ConsistencyTracker**: Performance monitoring

### Task-Specific Pipelines
Different generation tasks use specialized pipelines:
- **Trainer Generation**: Team composition → Validation → Export
- **Script Generation**: Template selection → AI enhancement → Syntax validation
- **Content Generation**: Context analysis → Generation → Quality assurance

## Data Architecture

### Pokemon Data System
Comprehensive Pokemon information system:
```javascript
const pokemonData = {
  basic: {          // Core identification
    dex_number: 1,
    name: "Bulbasaur",
    types: ["Grass", "Poison"]
  },
  stats: {          // Battle statistics
    hp: 45, attack: 49, defense: 49,
    special_attack: 65, special_defense: 65, speed: 45
  },
  evolution: {      // Evolution information
    evolves_to: "Ivysaur",
    evolution_level: 16,
    evolution_method: "level"
  },
  habitat: {        // Environmental data
    biomes: ["Forest", "Grassland"],
    rarity: "common"
  }
};
```

### Project Data Structure
User projects maintain structured data:
```javascript
const projectStructure = {
  metadata: {
    id: "project_uuid",
    name: "My ROM Hack",
    created: "2024-01-01",
    version: "0.1.0"
  },
  trainers: [],     // Generated trainers
  scripts: [],      // HMA scripts  
  flags: [],        // Flag definitions
  sprites: [],      // Custom sprites
  settings: {}      // Project preferences
};
```

### Caching Strategy
Multi-layer caching for performance:
- **Memory Cache**: Frequently accessed Pokemon data
- **Session Cache**: Generated content and validation results
- **Persistent Cache**: User preferences and project metadata

## State Management

### Component State
Local component state for UI interactions:
```javascript
const [formData, setFormData] = useState(defaultConfig);
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});
```

### Context State
Shared state through React contexts:
```javascript
const ProjectContext = createContext();
const LabAssistantContext = createContext();
const ThemeContext = createContext();
```

### Service State
Stateful services for complex operations:
```javascript
class TrainerGenerationService {
  constructor() {
    this.cache = new Map();
    this.generators = new Map();
  }
}
```

## Performance Architecture

### Code Splitting
Dynamic imports for large components:
```javascript
const TrainerArchitect = lazy(() => import('./pages/TrainerArchitect'));
const ScriptSage = lazy(() => import('./pages/ScriptSage'));
```

### Memoization Strategy
Expensive operations are memoized:
```javascript
const memoizedSearch = useMemo(() => 
  createOptimizedSearch(pokemonDatabase), [pokemonDatabase]
);

const MemoizedTrainerCard = memo(TrainerCard, (prev, next) => 
  prev.trainer.id === next.trainer.id
);
```

### Resource Optimization
- **Image Optimization**: Sprite compression and lazy loading
- **Bundle Splitting**: Vendor and application code separation
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip/Brotli compression for assets

## Security Architecture

### Data Validation
Input validation at multiple layers:
```javascript
const validateTrainerConfig = (config) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    level_min: Joi.number().min(1).max(100),
    level_max: Joi.number().min(1).max(100),
    trainer_class: Joi.string().valid(...VALID_CLASSES)
  });
  return schema.validate(config);
};
```

### Content Sanitization
User-generated content is sanitized:
- HTML content escaped
- Script injection prevention
- File upload validation
- Path traversal protection

### API Security
Local API interactions are secured:
- Request validation
- Rate limiting for AI operations
- Error message sanitization
- Session management

## Integration Points

### Ollama Integration
Local LLM processing through Ollama:
```javascript
const ollamaClient = {
  async generate(prompt, options) {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: options.model, prompt })
    });
    return response.json();
  }
};
```

### File System Integration
Project file management:
```javascript
const projectFS = {
  async saveProject(projectData) {
    const blob = new Blob([JSON.stringify(projectData)], 
      { type: 'application/json' }
    );
    return await saveAs(blob, `${projectData.name}.emerald`);
  }
};
```

### ROM Integration
Future ROM file processing capabilities:
- ROM file parsing and validation
- Asset extraction and management
- Script compilation and injection
- Testing and debugging support

## Error Handling Architecture

### Error Boundaries
React error boundaries for graceful degradation:
```jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Service Error Handling
Consistent error handling across services:
```javascript
class ServiceError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}
```

### User Feedback
Error communication strategy:
- **Toast Notifications**: Non-blocking error messages
- **Inline Validation**: Real-time form feedback
- **Error Pages**: Graceful handling of critical failures
- **Recovery Options**: User-actionable error resolution

## Testing Architecture

### Unit Testing
Component and service testing with Vitest:
```javascript
describe('TrainerGenerator', () => {
  test('generates valid trainer with correct parameters', async () => {
    const config = { name: 'Test', level_min: 10, level_max: 15 };
    const trainer = await TrainerGenerator.generate(config);
    expect(trainer).toMatchSchema(trainerSchema);
  });
});
```

### Integration Testing
Cross-component interaction testing:
```javascript
test('trainer generation flow', async () => {
  render(<TrainerArchitect />);
  
  // Configure trainer parameters
  fireEvent.change(screen.getByLabelText('Name'), { 
    target: { value: 'Test Trainer' } 
  });
  
  // Generate trainer
  fireEvent.click(screen.getByText('Generate'));
  
  // Verify result
  await waitFor(() => {
    expect(screen.getByText('Test Trainer')).toBeInTheDocument();
  });
});
```

### End-to-End Testing
Complete workflow testing with Playwright:
```javascript
test('complete trainer creation workflow', async ({ page }) => {
  await page.goto('/trainer-architect');
  await page.fill('[data-testid="trainer-name"]', 'E2E Trainer');
  await page.click('[data-testid="generate-button"]');
  await expect(page.locator('[data-testid="trainer-result"]')).toBeVisible();
});
```

## Deployment Architecture

### Build Process
Vite-based build pipeline:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pokemon: ['./src/data/pokemonData.js'],
          ai: ['./src/lib/consistency/']
        }
      }
    }
  }
});
```

### Environment Configuration
Environment-specific settings:
```javascript
const config = {
  development: {
    ollamaUrl: 'http://localhost:11434',
    debugMode: true,
    logLevel: 'debug'
  },
  production: {
    ollamaUrl: process.env.VITE_OLLAMA_URL,
    debugMode: false,
    logLevel: 'error'
  }
};
```

### Asset Management
Optimized asset delivery:
- **Image Compression**: Pokemon sprites and UI assets
- **Code Splitting**: Route-based and feature-based chunks
- **Caching Strategy**: Long-term caching for static assets
- **CDN Integration**: Asset delivery optimization

## Monitoring and Analytics

### Performance Monitoring
Client-side performance tracking:
```javascript
const performanceTracker = {
  trackGeneration(type, duration, success) {
    console.log(`${type} generation: ${duration}ms, success: ${success}`);
  },
  
  trackError(error, context) {
    console.error('Application error:', error, context);
  }
};
```

### User Analytics
Privacy-conscious usage analytics:
- Feature usage patterns
- Generation success rates
- Performance metrics
- Error frequency and types

### System Health
Application health monitoring:
- Memory usage tracking
- API response times
- Error rate monitoring
- Resource utilization

## Future Architecture Considerations

### Scalability
- **Micro-frontend Architecture**: Feature-based application splitting
- **Service Worker Enhancement**: Advanced offline capabilities
- **WebAssembly Integration**: Performance-critical operations
- **Progressive Web App**: Native-like mobile experience

### Extensibility
- **Plugin System**: Third-party feature integration
- **API Layer**: External tool integration
- **Theme System**: Customizable UI theming
- **Localization**: Multi-language support

### Advanced Features
- **Real-time Collaboration**: Multi-user project editing
- **Version Control**: Project history and branching
- **Cloud Sync**: Cross-device project synchronization
- **Advanced AI**: Multi-modal content generation