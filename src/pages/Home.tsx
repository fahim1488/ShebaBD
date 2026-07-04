import { useState } from 'react';
import {
  Search,
  Mail,
  ArrowRight,
  Trash,
  Plus,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/context/ThemeToggle';

function Home() {
  const [loadingState, setLoadingState] = useState(false);

  return (
    <main className="min-h-screen bg-ds-background text-ds-foreground transition-colors duration-ds-normal p-ds-4 md:p-ds-8">
      <div className="max-w-6xl mx-auto space-y-ds-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-ds-muted/20 pb-ds-4">
          <div>
            <h1 className="text-ds-heading font-display">ShebaBD Design System</h1>
            <p className="text-ds-caption text-ds-muted">Reusable Button Component Showcase</p>
          </div>
          <div className="flex items-center gap-ds-2">
            <span className="text-ds-caption text-ds-muted">Toggle Theme:</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Section: Variants */}
        <section className="space-y-ds-3">
          <h2 className="text-ds-title font-semibold">1. Button Variants</h2>
          <div className="flex flex-wrap gap-ds-2 p-ds-4 bg-ds-surface rounded-ds-md border border-ds-muted/10 shadow-sm">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </section>

        {/* Section: Sizes */}
        <section className="space-y-ds-3">
          <h2 className="text-ds-title font-semibold">2. Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-ds-2 p-ds-4 bg-ds-surface rounded-ds-md border border-ds-muted/10 shadow-sm">
            <div className="flex flex-col items-start gap-ds-1">
              <span className="text-xs text-ds-muted">xs</span>
              <Button size="xs">Extra Small</Button>
            </div>
            <div className="flex flex-col items-start gap-ds-1">
              <span className="text-xs text-ds-muted">sm</span>
              <Button size="sm">Small</Button>
            </div>
            <div className="flex flex-col items-start gap-ds-1">
              <span className="text-xs text-ds-muted">md</span>
              <Button size="md">Medium</Button>
            </div>
            <div className="flex flex-col items-start gap-ds-1">
              <span className="text-xs text-ds-muted">lg</span>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-col items-start gap-ds-1">
              <span className="text-xs text-ds-muted">xl</span>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>
        </section>

        {/* Section: States & Behaviors */}
        <section className="space-y-ds-3">
          <h2 className="text-ds-title font-semibold">3. States & Behaviors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-4 p-ds-4 bg-ds-surface rounded-ds-md border border-ds-muted/10 shadow-sm">
            <div className="space-y-ds-2">
              <h3 className="text-ds-subtitle font-medium">Interactive Loading Toggle</h3>
              <div className="flex gap-ds-2 items-center">
                <Button
                  onClick={() => setLoadingState((prev) => !prev)}
                  variant="outline"
                  size="sm"
                >
                  Toggle Demo Loading ({loadingState ? 'ON' : 'OFF'})
                </Button>
                <Button loading={loadingState} variant="primary">
                  Demo Button
                </Button>
              </div>
            </div>

            <div className="space-y-ds-2">
              <h3 className="text-ds-subtitle font-medium">Disabled States</h3>
              <div className="flex flex-wrap gap-ds-2">
                <Button disabled variant="primary">Disabled Primary</Button>
                <Button disabled variant="outline">Disabled Outline</Button>
                <Button disabled variant="ghost">Disabled Ghost</Button>
              </div>
            </div>

            <div className="space-y-ds-2 col-span-1 md:col-span-2">
              <h3 className="text-ds-subtitle font-medium">Rounding & Width</h3>
              <div className="space-y-ds-2">
                <div className="flex flex-wrap gap-ds-2">
                  <Button rounded variant="primary">Rounded Primary</Button>
                  <Button rounded variant="secondary">Rounded Secondary</Button>
                  <Button rounded variant="outline">Rounded Outline</Button>
                </div>
                <Button fullWidth variant="primary">Full Width Button</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Icons */}
        <section className="space-y-ds-3">
          <h2 className="text-ds-title font-semibold">4. Icon Support (Lucide React)</h2>
          <div className="flex flex-wrap items-center gap-ds-2 p-ds-4 bg-ds-surface rounded-ds-md border border-ds-muted/10 shadow-sm">
            <Button leftIcon={Mail}>Left Icon</Button>
            <Button rightIcon={ArrowRight} variant="secondary">Right Icon</Button>
            <Button leftIcon={Plus} rightIcon={ArrowRight} variant="outline">Both Icons</Button>
            <Button leftIcon={Search} iconOnly aria-label="Search items" />
            <Button leftIcon={Trash} variant="danger" iconOnly aria-label="Delete item" />
            <Button leftIcon={Check} variant="success" rounded iconOnly aria-label="Success check" />
            <Button
              variant="outline"
              leftIcon={<span className="text-lg mr-1">🔥</span>}
            >
              Custom Element Icon
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
