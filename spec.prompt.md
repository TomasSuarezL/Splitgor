# Money Split App - AI Development Prompt

## Project Overview
Build a money split application that tracks expenses among group members and calculates how much each person owes to settle debts equally. The app should be clean, modern, and fully functional with persistent data storage.

## Tech Stack

### Frontend Framework
- **Framework**: TanStack Start (latest) - Full-stack React framework with SSR/SSG
- **React**: React 19+ with TypeScript
- **Router**: TanStack Router (built-in with TanStack Start)
- **UI Library**: shadcn/ui (built on Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **Form Handling**: TanStack Form (type-safe, powerful validation)
- **Data Fetching**: TanStack Query v5 (React Query)
- **State Management**: TanStack Query + React Context for UI state
- **Date Handling**: date-fns v3
- **Validation**: Zod (schema validation)

### Backend/Database
- **Backend-as-a-Service**: Supabase
  - **Authentication**: Supabase Auth (email/password, magic links)
  - **Database**: PostgreSQL (with real-time subscriptions)
  - **Storage**: Supabase Storage (for receipt images)
  - **Edge Functions**: Supabase Edge Functions (if needed for complex logic)
  - **Row Level Security**: Built-in PostgreSQL RLS for data security
- **API Client**: @supabase/supabase-js (latest)
- **Why Supabase**: 
  - No separate backend needed
  - PostgreSQL (relational, powerful queries)
  - Real-time subscriptions
  - Built-in auth and storage
  - Row-level security
  - Better developer experience with SQL
  - Open source

## Core Features

### 1. Authentication
- Email/password registration and login (Supabase Auth)
- Magic link authentication (passwordless option)
- Password reset functionality via email
- Protected routes (redirect to login if not authenticated)
- User profile with display name and avatar
- Session management with automatic token refresh
- Logout functionality
- Optional: Social auth (Google, GitHub) for future

### 2. Group Management
- **Create Group**: Name, optional description, invite members by email
- **View Groups**: List all groups user belongs to
- **Group Details**: 
  - Member list with names and avatars (initials)
  - Total group spending
  - Individual balances (who owes what)
  - Leave group option
  - Archive group option (creator only)
- **Add Members**: Invite by email (they must have an account)
- **Remove Members**: Only group creator can remove (can't remove if person has unsettled debts)

### 3. Expense Management
- **Add Expense**:
  - Description (required)
  - Amount (required, positive number)
  - Paid by (dropdown of group members)
  - Date (defaults to today)
  - Category (optional): Food, Transport, Accommodation, Entertainment, Utilities, Other
  - Split type:
    - **Equal**: Divide equally among all members
    - **Unequal**: Manually specify amount per person
    - **Percentage**: Specify percentage per person
    - **By shares**: Assign shares (e.g., person A: 2 shares, person B: 1 share)
  - Participants (checkboxes - who's involved in this expense)
  - Optional receipt image upload
  - Notes/comments
  
- **View Expenses**:
  - Chronological list (most recent first)
  - Filter by: date range, category, paid by, participant
  - Search by description
  - Pagination (20 per page)
  
- **Edit Expense**: Update any field (only creator or payer can edit)
- **Delete Expense**: Soft delete with confirmation (only creator or payer)

### 4. Settlement/Balance Calculation
- **Balance Overview**:
  - Show each member's net balance (positive = owed money, negative = owes money)
  - Visual indicator (green for credit, red for debt)
  - Total amount in circulation
  
- **Settlement Suggestions**:
  - Calculate optimal settlement path (minimize number of transactions)
  - Show "Person A pays Person B $X" for each required transaction
  - "Settle Up" button to record settlement
  
- **Record Settlement**:
  - From person (dropdown)
  - To person (dropdown)
  - Amount (auto-fill with suggested amount, editable)
  - Date
  - Optional note
  - Mark as "settled" to update balances
  
- **Settlement History**: List of all past settlements with dates and amounts

### 5. Dashboard/Home
- Summary cards:
  - Your total balance across all groups
  - Number of active groups
  - Recent expenses (last 5)
  - Pending settlements
- Quick actions: Add expense, Create group, View all groups

### 6. Reports & Analytics (Nice to have)
- **Group Expense Report**:
  - Total spent by category (pie chart)
  - Spending over time (line chart)
  - Top spenders
  - Average expense per person
  - Export to CSV
  
- **Personal Report**:
  - Your total spending across groups
  - Your payment patterns
  - Groups where you owe/are owed most

## Database Schema (PostgreSQL)

### Tables

#### profiles (extends auth.users)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
interface Profile {
  id: string; // UUID
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

#### groups
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
interface Group {
  id: string; // UUID
  name: string;
  description?: string;
  created_by: string;
  currency: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}
```

#### group_members
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

```typescript
interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}
```

#### expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  paid_by UUID REFERENCES profiles(id) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('food', 'transport', 'accommodation', 'entertainment', 'utilities', 'other')),
  split_type TEXT NOT NULL CHECK (split_type IN ('equal', 'unequal', 'percentage', 'shares')),
  receipt_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  expense_date: string;
  category: 'food' | 'transport' | 'accommodation' | 'entertainment' | 'utilities' | 'other';
  split_type: 'equal' | 'unequal' | 'percentage' | 'shares';
  receipt_url?: string;
  notes?: string;
  created_by: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
```

#### expense_splits
```sql
CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  UNIQUE(expense_id, user_id)
);
```

```typescript
interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
}
```

#### settlements
```sql
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  from_user UUID REFERENCES profiles(id) NOT NULL,
  to_user UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_user != to_user)
);
```

```typescript
interface Settlement {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  settlement_date: string;
  notes?: string;
  created_at: string;
}
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_user_id ON expense_splits(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_settlements_group_id ON settlements(group_id);
CREATE INDEX idx_settlements_from_user ON settlements(from_user);
CREATE INDEX idx_settlements_to_user ON settlements(to_user);
```

### Database Functions & Triggers

#### Auto-update updated_at timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Validate expense splits sum to total
```sql
CREATE OR REPLACE FUNCTION validate_expense_splits()
RETURNS TRIGGER AS $$
DECLARE
  total_split DECIMAL(10, 2);
  expense_amount DECIMAL(10, 2);
BEGIN
  SELECT amount INTO expense_amount FROM expenses WHERE id = NEW.expense_id;
  SELECT COALESCE(SUM(amount), 0) INTO total_split 
    FROM expense_splits 
    WHERE expense_id = NEW.expense_id;
  
  IF total_split > expense_amount THEN
    RAISE EXCEPTION 'Total splits (%) exceed expense amount (%)', total_split, expense_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_expense_splits_sum BEFORE INSERT OR UPDATE ON expense_splits
  FOR EACH ROW EXECUTE FUNCTION validate_expense_splits();
```

## UI/UX Requirements

### Design Principles
- **Clean & Minimal**: Plenty of white space, no clutter
- **Mobile-First**: Responsive design, works on all screen sizes
- **Intuitive**: Clear labels, helpful tooltips, obvious CTAs
- **Fast**: Optimistic UI updates, skeleton loaders
- **Accessible**: ARIA labels, keyboard navigation, proper contrast

### Color Scheme
- Primary: Emerald/Green (for money theme)
- Success: Green
- Warning: Amber
- Error: Red
- Neutral: Slate/Gray
- Background: White/Light gray

### Key Components Needed
1. **Layout**:
   - AppShell with sidebar navigation (desktop) / bottom nav (mobile)
   - Header with logo, user menu
   - Breadcrumbs for navigation context

2. **Forms**:
   - Input fields with validation
   - Select dropdowns
   - Date pickers
   - Currency input (formatted)
   - Multi-select checkboxes
   - Image upload with preview

3. **Data Display**:
   - Cards for summaries
   - Tables for expense lists
   - Badges for categories/status
   - Avatar components (with initials fallback)
   - Empty states with illustrations

4. **Interactive**:
   - Modal dialogs for forms
   - Confirmation dialogs
   - Toast notifications
   - Loading skeletons
   - Progress indicators

5. **Charts** (for analytics):
   - Use recharts library
   - Pie chart for category breakdown
   - Line chart for spending trends
   - Bar chart for member comparison

### Navigation Structure
```
/
├── /login
├── /register
├── /dashboard (protected)
├── /groups (protected)
│   ├── /new
│   └── /:groupId
│       ├── /expenses
│       ├── /balances
│       ├── /settlements
│       ├── /members
│       └── /analytics
└── /profile (protected)
```

## Functional Requirements

### Balance Calculation Algorithm
1. For each member in a group:
   - Sum all expenses they paid
   - Sum all their shares of expenses
   - Balance = (amount paid) - (share of total expenses)

2. For settlement optimization (minimize transactions):
   - Create list of creditors (positive balance)
   - Create list of debtors (negative balance)
   - Match largest creditor with largest debtor
   - Continue until all balanced

### Validation Rules
- Expense amount: Must be positive number, max 2 decimal places
- Group name: 3-50 characters, required
- Email: Valid email format
- Password: Min 8 characters, 1 uppercase, 1 number
- Split amounts: Must sum to total expense amount
- Settlement amount: Cannot exceed what's owed

### Error Handling
- Network errors: Retry with exponential backoff
- Validation errors: Show inline error messages
- Auth errors: Redirect to login with return URL
- Permission errors: Show friendly message
- Not found: 404 page with navigation

### Performance Considerations
- Use TanStack Router's code-splitting and lazy loading
- TanStack Query automatic caching and deduplication
- Prefetch data on route hover with TanStack Router
- Use TanStack Virtual for long lists (expenses, settlements)
- Debounce search inputs (use useDebouncedValue)
- Optimize images before upload (compress receipts)
- Use React.memo for expensive components
- Enable Supabase Realtime selectively (only active views)
- Implement optimistic updates with TanStack Query
- Use Supabase's connection pooling (built-in)
- Index database queries properly (already defined above)

## Security & Privacy

### Row Level Security (RLS) Policies

Enable RLS on all tables:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
```

#### Profiles Policies
```sql
-- Users can view all profiles (needed for group members)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

#### Groups Policies
```sql
-- Users can view groups they're members of
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Group creators can update their groups
CREATE POLICY "Group creators can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());
```

#### Group Members Policies
```sql
-- Users can view members of groups they belong to
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Group creators can add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- Group creators can remove members
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );
```

#### Expenses Policies
```sql
-- Users can view expenses in their groups
CREATE POLICY "Users can view expenses in their groups"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can create expenses
CREATE POLICY "Group members can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Expense creator or payer can update
CREATE POLICY "Expense creator or payer can update"
  ON expenses FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR paid_by = auth.uid());

-- Expense creator or payer can delete (soft delete)
CREATE POLICY "Expense creator or payer can delete"
  ON expenses FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR paid_by = auth.uid());
```

#### Expense Splits Policies
```sql
-- Users can view splits for expenses in their groups
CREATE POLICY "Users can view expense splits in their groups"
  ON expense_splits FOR SELECT
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Expense creators can manage splits
CREATE POLICY "Expense creators can manage splits"
  ON expense_splits FOR ALL
  TO authenticated
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE created_by = auth.uid()
    )
  );
```

#### Settlements Policies
```sql
-- Users can view settlements in their groups
CREATE POLICY "Users can view settlements in their groups"
  ON settlements FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Users involved in settlement can create it
CREATE POLICY "Settlement parties can create settlements"
  ON settlements FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user = auth.uid() OR to_user = auth.uid()
  );
```

### Data Privacy
- Users can only see groups they belong to
- Email addresses only visible to group members
- Expenses only visible to group members
- No public data exposure
- Receipt images stored with RLS in Supabase Storage

## Additional Features (Future Enhancements)

1. **Notifications**:
   - Email notifications for new expenses
   - Push notifications for settlement requests
   - In-app notification center

2. **Recurring Expenses**:
   - Set up monthly bills (rent, subscriptions)
   - Auto-create on schedule

3. **Multi-Currency Support**:
   - Select currency per group
   - Automatic conversion using exchange rates

4. **Itemized Receipts**:
   - OCR to extract items from receipt image
   - Split specific items among members

5. **Social Features**:
   - Comments on expenses
   - Like/react to settlements
   - Activity feed per group

6. **Integrations**:
   - Import from bank statements
   - Export to accounting software
   - Calendar integration for expense dates

7. **Offline Support**:
   - Service worker for PWA
   - Cache expenses locally
   - Sync when online

## Testing Requirements

### Unit Tests
- Utility functions (balance calculation, split calculation)
- React components (using React Testing Library + Vitest)
- Custom hooks (with @testing-library/react-hooks)
- TanStack Query hooks (with mock Supabase client)
- Zod schema validations

### Integration Tests
- User flows (create group, add expense, settle up)
- Form submissions with TanStack Form
- Navigation with TanStack Router
- Database queries with Supabase (use test database)

### E2E Tests (Optional)
- Complete user journeys using Playwright
- Critical paths only (auth, create expense, settle)
- Run against staging Supabase project

### Testing Setup
```bash
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D @testing-library/react-hooks
npm install -D msw # for mocking Supabase API
```

## Deployment

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: for edge functions or server-side
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Setup
1. Create Supabase project at https://supabase.com
2. Run database migrations (SQL scripts above)
3. Enable Email Auth in Authentication settings
4. Configure email templates
5. Set up Storage bucket for receipts with RLS policies
6. Get project URL and anon key from settings

### Build & Deploy

#### Option 1: Vercel (Recommended for TanStack Start)
```bash
npm run build
vercel deploy
```

Configure environment variables in Vercel dashboard.

#### Option 2: Netlify
```bash
npm run build
netlify deploy --prod
```

#### Option 3: Self-hosted (VPS/Docker)
```bash
npm run build
# Serve the .output directory with Node.js
node .output/server/index.mjs
```

### CI/CD
- GitHub Actions workflow
- Run tests and type-check on PR
- Auto-deploy main branch to Vercel/Netlify
- Run database migrations automatically

### Database Migrations
Use Supabase CLI for version-controlled migrations:
```bash
supabase migration new initial_schema
supabase db push
```

## Success Criteria

The app is complete when:
1. ✅ Users can register, login, and manage their profile
2. ✅ Users can create groups and invite members
3. ✅ Users can add, edit, and delete expenses
4. ✅ Balance calculations are accurate
5. ✅ Settlement suggestions minimize transactions
6. ✅ UI is responsive and works on mobile
7. ✅ Data persists and syncs in real-time
8. ✅ App is deployed and accessible online
9. ✅ No console errors in production
10. ✅ All forms have proper validation

## Development Tips

1. **Start with Supabase Setup**:
   - Create Supabase project
   - Run all SQL migrations (tables, indexes, triggers, RLS policies)
   - Enable Email Auth in Authentication settings
   - Create Storage bucket named 'receipts' with public read policy
   - Get project URL and anon key

2. **Initialize TanStack Start Project**:
   ```bash
   npm create @tanstack/start@latest
   cd your-project
   npm install
   ```

3. **Install Dependencies**:
   ```bash
   npm install @supabase/supabase-js
   npm install @tanstack/react-query
   npm install @tanstack/react-form
   npm install zod
   npm install date-fns
   npm install recharts
   
   # shadcn/ui
   npx shadcn@latest init
   npx shadcn@latest add button card input form select dialog toast
   npx shadcn@latest add table avatar badge dropdown-menu
   ```

4. **Build Incrementally**:
   - Set up Supabase client and auth context first
   - Then authentication pages (login, register)
   - Then group management (create, list, view)
   - Then expense tracking (add, list, edit)
   - Finally settlements and analytics

5. **Use TypeScript Strictly**:
   - Define all interfaces from database schema
   - Use Zod for runtime validation
   - No `any` types
   - Enable strict mode in tsconfig.json
   - Use Supabase's auto-generated types:
     ```bash
     supabase gen types typescript --project-id your-project > src/types/database.types.ts
     ```

6. **Project Structure**:
   ```
   src/
   ├── routes/          # TanStack Router routes
   │   ├── __root.tsx
   │   ├── index.tsx
   │   ├── login.tsx
   │   ├── dashboard.tsx
   │   └── groups/
   │       ├── index.tsx
   │       └── $groupId/
   │           ├── index.tsx
   │           ├── expenses.tsx
   │           ├── balances.tsx
   │           └── settlements.tsx
   ├── components/
   │   ├── ui/          # shadcn components
   │   ├── layout/
   │   ├── auth/
   │   ├── groups/
   │   ├── expenses/
   │   └── settlements/
   ├── lib/
   │   ├── supabase.ts   # Supabase client
   │   ├── queries.ts    # TanStack Query hooks
   │   └── utils.ts
   ├── hooks/
   │   ├── useAuth.tsx
   │   ├── useGroups.tsx
   │   └── useExpenses.tsx
   ├── types/
   │   ├── database.types.ts  # Generated from Supabase
   │   └── index.ts
   └── app.tsx
   ```

7. **TanStack Query Setup**:
   ```typescript
   // Set up query client with proper defaults
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60, // 1 minute
         retry: 1,
       },
     },
   });
   ```

8. **Real-time Subscriptions**:
   ```typescript
   // Use Supabase real-time for live updates
   useEffect(() => {
     const channel = supabase
       .channel('expenses-changes')
       .on('postgres_changes', 
         { event: '*', schema: 'public', table: 'expenses' },
         () => queryClient.invalidateQueries(['expenses'])
       )
       .subscribe();
     
     return () => { supabase.removeChannel(channel); };
   }, []);
   ```

9. **Authentication Helper**:
   ```typescript
   // Create reusable auth hook
   const useAuth = () => {
     const [session, setSession] = useState(null);
     
     useEffect(() => {
       supabase.auth.getSession().then(({ data: { session } }) => {
         setSession(session);
       });
       
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (_event, session) => setSession(session)
       );
       
       return () => subscription.unsubscribe();
     }, []);
     
     return session;
   };
   ```

10. **Form Validation Pattern**:
    ```typescript
    // Use TanStack Form with Zod
    const expenseSchema = z.object({
      description: z.string().min(3).max(100),
      amount: z.number().positive().max(999999.99),
      category: z.enum(['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'other']),
    });
    
    const form = useForm({
      defaultValues: { description: '', amount: 0, category: 'food' },
      onSubmit: async ({ value }) => {
        const validated = expenseSchema.parse(value);
        // Submit to Supabase
      },
    });
    ```

## Package Dependencies

### Core Framework & Routing
```json
{
  "dependencies": {
    "@tanstack/start": "latest",
    "@tanstack/react-router": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vinxi": "latest"
  }
}
```

### Data Fetching & State
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-query-devtools": "^5.59.0",
    "@supabase/supabase-js": "^2.46.1"
  }
}
```

### Forms & Validation
```json
{
  "dependencies": {
    "@tanstack/react-form": "latest",
    "zod": "^3.23.8"
  }
}
```

### UI & Styling
```json
{
  "dependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/typography": "latest",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  }
}
```

### Utilities
```json
{
  "dependencies": {
    "date-fns": "^4.1.0",
    "recharts": "^2.13.3",
    "@tanstack/react-virtual": "^3.10.8",
    "lucide-react": "^0.454.0"
  }
}
```

### Development
```json
{
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.3",
    "vite": "^6.0.1",
    "vitest": "^2.1.4",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "msw": "^2.6.4",
    "eslint": "^9.14.0",
    "prettier": "^3.3.3"
  }
}
```

Install all with:
```bash
npm install @tanstack/start @tanstack/react-router @tanstack/react-query
npm install @tanstack/react-form @supabase/supabase-js zod
npm install date-fns recharts @tanstack/react-virtual lucide-react
npm install tailwindcss@next @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge
npx shadcn@latest init
```

---

## Final Notes

This app should be production-ready with proper error handling, loading states, and user feedback. Focus on making the core expense tracking and settlement features bulletproof before adding nice-to-have features.

### Why TanStack Start + Supabase?

**TanStack Start Advantages:**
- **Type-safe routing** - Catch routing errors at compile time
- **Server-side rendering** - Better SEO and initial load performance
- **Code splitting** - Automatic, no manual configuration needed
- **File-based routing** - Intuitive project structure
- **Nested layouts** - Share UI across routes easily
- **Best-in-class DX** - Hot module replacement, TypeScript first
- **Built by the TanStack team** - Same team behind React Query, React Table

**Supabase Advantages:**
- **PostgreSQL** - Robust, ACID compliant, complex queries with JOINs
- **Real-time subscriptions** - Live updates across all clients instantly
- **Row Level Security** - Database-level authorization, impossible to bypass
- **Built-in Auth** - Email/password, magic links, OAuth ready
- **Storage** - Integrated file uploads with RLS policies
- **Edge Functions** - Deploy serverless functions if needed
- **Open source** - Can self-host, no vendor lock-in
- **Auto-generated TypeScript types** - Type safety from database to UI
- **Great DX** - Excellent dashboard, CLI tools, migration system

**TanStack Query Benefits:**
- **Automatic caching** - No manual cache management
- **Background refetching** - Keep data fresh automatically
- **Optimistic updates** - Instant UI feedback
- **Request deduplication** - Multiple components requesting same data? One request.
- **Pagination & infinite queries** - Built-in patterns
- **Devtools** - Visualize cache state and queries

### Development Workflow
1. Set up Supabase project and run all SQL migrations
2. Initialize TanStack Start project with TypeScript
3. Configure Supabase client singleton
4. Set up TanStack Query provider
5. Build features incrementally:
   - Auth (login, register, password reset)
   - Groups (create, list, view, add members)
   - Expenses (add, list, edit, delete with splits)
   - Settlements (calculate, suggest, record)
   - Analytics (charts and reports)
6. Use real-time subscriptions for collaborative features
7. Deploy to Vercel with environment variables
8. Set up CI/CD with GitHub Actions

### Best Practices
- **TypeScript everywhere** - Use strict mode, generate types from Supabase schema
- **Zod for validation** - Runtime type checking for forms and API responses
- **TanStack Query for all data** - No useState for server data
- **Optimistic updates** - Use TanStack Query's onMutate for instant feedback
- **Error boundaries** - Catch and display errors gracefully
- **Loading states** - Use Suspense or skeleton loaders
- **Accessibility** - shadcn/ui provides good defaults, test with keyboard
- **Mobile-first** - Design for small screens, enhance for desktop
- **Real-time selectively** - Don't subscribe to everything, be strategic
- **Database indexes** - Already defined above, ensure they're created

The UI should feel polished and professional - shadcn/ui components provide a consistent, modern design system. TanStack Form gives you type-safe forms with powerful validation, and TanStack Router ensures type-safe navigation.

**Remember:** Better to have a simple app that works perfectly than a complex app with bugs. Ship the core features first, iterate based on user feedback!