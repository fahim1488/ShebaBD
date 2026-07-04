import { useState } from 'react';
import {
  Search,
  Mail,
  ArrowRight,
  Trash,
  Plus,
  Check,
  Phone,
  User,
  Globe,
  DollarSign,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TextInput,
  EmailInput,
  NumberInput,
  PasswordInput,
  SearchInput,
} from '@/components/ui/input';
import { ThemeToggle } from '@/context/ThemeToggle';

// ─── Showcase Section Wrapper ─────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-ds-foreground border-b border-ds-muted/20 pb-2">
        {title}
      </h2>
      <div className="rounded-ds-lg border border-ds-muted/10 bg-ds-surface p-6 shadow-ds-sm">
        {children}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Home() {
  // Button showcase state
  const [btnLoading, setBtnLoading] = useState(false);

  // Input showcase state
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [inputLoading, setInputLoading] = useState(false);

  return (
    <main className="min-h-screen bg-ds-background text-ds-foreground transition-colors duration-ds-normal">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between border-b border-ds-muted/20 pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-ds-foreground">
              ShebaBD Design System
            </h1>
            <p className="mt-1 text-sm text-ds-muted">
              Button & Input Component Library Showcase
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ds-muted">Theme:</span>
            <ThemeToggle />
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            BUTTON SHOWCASE
        ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-ds-foreground">
            🔘 Button Component
          </h2>
        </div>

        <Section title="1. Variants">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Section>

        <Section title="2. Sizes">
          <div className="flex flex-wrap items-center gap-4">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <span className="text-xs text-ds-muted">{s}</span>
                <Button size={s}>Button</Button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. States, Icons & Features">
          <div className="flex flex-wrap gap-3">
            <Button
              loading={btnLoading}
              onClick={() => setBtnLoading((p) => !p)}
              variant="primary"
            >
              {btnLoading ? 'Loading…' : 'Toggle Loading'}
            </Button>
            <Button disabled variant="secondary">Disabled</Button>
            <Button rounded variant="outline">Rounded</Button>
            <Button leftIcon={Mail}>Left Icon</Button>
            <Button rightIcon={ArrowRight} variant="secondary">Right Icon</Button>
            <Button leftIcon={Plus} rightIcon={ArrowRight} variant="outline">Both Icons</Button>
            <Button leftIcon={Search} iconOnly aria-label="Search" />
            <Button leftIcon={Trash} variant="danger" iconOnly aria-label="Delete" />
            <Button leftIcon={Check} variant="success" rounded iconOnly aria-label="Success" />
            <Button fullWidth variant="ghost" className="mt-2">Full Width Ghost</Button>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════
            INPUT SHOWCASE
        ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-2 pt-4">
          <h2 className="font-display text-2xl font-semibold text-ds-foreground">
            📝 Input Component Library
          </h2>
        </div>

        {/* ── 4. Text Input ───────────────────────────────────────────────── */}
        <Section title="4. Text Input — All Sizes">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <TextInput
              size="sm"
              label="Small (sm)"
              placeholder="Small input…"
              prefixIcon={User}
            />
            <TextInput
              size="md"
              label="Medium (md)"
              placeholder="Medium input…"
              prefixIcon={User}
            />
            <TextInput
              size="lg"
              label="Large (lg)"
              placeholder="Large input…"
              prefixIcon={User}
            />
          </div>
        </Section>

        {/* ── 5. Validation States ─────────────────────────────────────────── */}
        <Section title="5. Validation States">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <TextInput
              label="Default State"
              placeholder="Type something…"
              helperText="This is a helper message."
            />
            <TextInput
              label="Success State"
              placeholder="Valid input"
              inputState="success"
              value="john@example.com"
              helperText="Email verified successfully."
              prefixIcon={Mail}
              onChange={() => {}}
            />
            <TextInput
              label="Error State"
              placeholder="Invalid input"
              inputState="error"
              value="bad-value"
              errorMessage="This field contains an error."
              prefixIcon={User}
              onChange={() => {}}
            />
          </div>
        </Section>

        {/* ── 6. Label Decorators ─────────────────────────────────────────── */}
        <Section title="6. Required, Optional & Helper Text">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              helperText="Must match your ID card."
              prefixIcon={User}
            />
            <TextInput
              label="Website"
              placeholder="https://example.com"
              optional
              helperText="Your personal or company URL."
              prefixIcon={Globe}
            />
            <EmailInput
              label="Email Address"
              placeholder="you@example.com"
              required
              prefixIcon={Mail}
              helperText="We'll never share your email."
            />
          </div>
        </Section>

        {/* ── 7. Prefix & Suffix Icons ─────────────────────────────────────── */}
        <Section title="7. Prefix & Suffix Icons">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextInput
              label="Phone Number"
              placeholder="+880 1XXX-XXXXXX"
              prefixIcon={Phone}
              helperText="Include country code."
            />
            <NumberInput
              label="Amount (USD)"
              placeholder="0.00"
              prefixIcon={DollarSign}
              helperText="Enter a positive value."
            />
            <TextInput
              label="Profile URL"
              placeholder="username"
              prefixIcon={User}
              suffixIcon={Globe}
              helperText="Your public profile handle."
            />
            <TextInput
              label="Security Code"
              placeholder="Enter code"
              prefixIcon={Lock}
              suffixIcon={Check}
              inputState="success"
              helperText="Code verified."
              value="ABC-123"
              onChange={() => {}}
            />
          </div>
        </Section>

        {/* ── 8. Clearable Controlled Input ───────────────────────────────── */}
        <Section title="8. Clearable Text Input (Controlled)">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextInput
              label="Clearable Input"
              placeholder="Type then click ✕ to clear…"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              clearable
              prefixIcon={User}
              helperText="Click × to reset the field."
            />
            <EmailInput
              label="Clearable Email"
              placeholder="your@email.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              clearable
              prefixIcon={Mail}
              helperText={
                emailValue ? `Value: ${emailValue}` : 'Start typing to see the clear button.'
              }
            />
          </div>
        </Section>

        {/* ── 9. Loading State ─────────────────────────────────────────────── */}
        <Section title="9. Loading State">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputLoading((p) => !p)}
              >
                Toggle Input Loading ({inputLoading ? 'ON' : 'OFF'})
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <TextInput
                label="Text Input"
                placeholder="Loading state…"
                loading={inputLoading}
                prefixIcon={User}
                value="Some value"
                onChange={() => {}}
              />
              <EmailInput
                label="Email Input"
                placeholder="Loading state…"
                loading={inputLoading}
                prefixIcon={Mail}
              />
              <PasswordInput
                label="Password Input"
                loading={inputLoading}
                value="secret123"
                onChange={() => {}}
              />
            </div>
          </div>
        </Section>

        {/* ── 10. Disabled & Read-Only ─────────────────────────────────────── */}
        <Section title="10. Disabled & Read-Only">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput
              label="Disabled Text"
              placeholder="Cannot type…"
              disabled
              prefixIcon={User}
            />
            <EmailInput
              label="Disabled Email"
              value="locked@example.com"
              disabled
              prefixIcon={Mail}
              onChange={() => {}}
            />
            <TextInput
              label="Read-Only Text"
              value="Read-only value"
              readOnly
              prefixIcon={Lock}
              helperText="This field is read-only."
              onChange={() => {}}
            />
            <PasswordInput
              label="Disabled Password"
              value="secretpassword"
              disabled
              onChange={() => {}}
            />
          </div>
        </Section>

        {/* ── 11. Password Input ───────────────────────────────────────────── */}
        <Section title="11. Password Input — Show / Hide Toggle">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              helperText="At least 8 characters."
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
              inputState={
                passwordValue && passwordValue.length < 8
                  ? 'error'
                  : passwordValue.length >= 8
                    ? 'success'
                    : 'default'
              }
              errorMessage="Password must be at least 8 characters."
              helperText={
                passwordValue.length >= 8
                  ? 'Password strength: Good 💪'
                  : undefined
              }
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
            <PasswordInput
              size="lg"
              label="Large Password"
              placeholder="Large size input"
              prefixIcon={Lock}
              optional
            />
          </div>
        </Section>

        {/* ── 12. Search Input ─────────────────────────────────────────────── */}
        <Section title="12. Search Input — Controlled & Uncontrolled">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Uncontrolled — internal state */}
            <SearchInput
              label="Uncontrolled Search"
              placeholder="Search anything… (press Esc to clear)"
              helperText="Internal state — press Escape to clear."
              onClear={() => console.info('Search cleared!')}
            />

            {/* Controlled */}
            <SearchInput
              label="Controlled Search"
              placeholder="Search with external state…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              helperText={searchValue ? `Searching for: "${searchValue}"` : 'Start typing to search.'}
            />

            {/* Full width */}
            <SearchInput
              label="Full Width Search"
              placeholder="Search the entire catalogue…"
              fullWidth
              size="lg"
              className="sm:col-span-2"
              helperText="Covers the full width of the container."
            />
          </div>
        </Section>

        {/* ── 13. Full Width ───────────────────────────────────────────────── */}
        <Section title="13. Full Width Inputs">
          <div className="flex flex-col gap-4">
            <TextInput
              label="Full-Width Text"
              placeholder="This stretches to fill its container…"
              fullWidth
              prefixIcon={User}
              helperText="fullWidth=true"
            />
            <EmailInput
              label="Full-Width Email"
              placeholder="your@company.com"
              fullWidth
              prefixIcon={Mail}
              required
            />
            <PasswordInput
              label="Full-Width Password"
              placeholder="Enter a strong password…"
              fullWidth
              prefixIcon={Lock}
            />
          </div>
        </Section>

        {/* ── 14. Number Input ────────────────────────────────────────────── */}
        <Section title="14. Number Input">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <NumberInput
              label="Quantity"
              placeholder="0"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              clearable
              helperText="Must be a positive number."
            />
            <NumberInput
              label="Price (USD)"
              placeholder="0.00"
              prefixIcon={DollarSign}
              inputState="success"
              value="199.99"
              onChange={() => {}}
              helperText="Price validated."
            />
            <NumberInput
              label="Error Number"
              placeholder="Enter amount"
              inputState="error"
              errorMessage="Value exceeds maximum limit."
              value="-5"
              onChange={() => {}}
            />
          </div>
        </Section>

      </div>
    </main>
  );
}

export default Home;
