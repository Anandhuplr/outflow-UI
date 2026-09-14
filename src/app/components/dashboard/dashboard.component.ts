import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AppUser,
  Budget,
  CategorySpend,
  NavItem,
  QuickAddAction,
  Transaction
} from '../../interfaces/dashboard.models';

import { AuthService } from '../../services/auth.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  /* ============================================================
     USER
     ============================================================ */

  user: AppUser | null = null;

  loadingUser = true;
  loadingDashboard = true;

  errorMessage = '';

  /* ============================================================
     NAVIGATION
     ============================================================ */

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid' },
    { label: 'Transactions', icon: 'swap' },
    { label: 'Budgets', icon: 'pie' },
    { label: 'Goals', icon: 'target' },
    { label: 'Reports', icon: 'doc' },
    { label: 'Settings', icon: 'gear' }
  ];

  activeNavIndex = 0;

  sidebarCollapsed = false;
  mobileNavOpen = false;

  /* ============================================================
     HEADLINE FIGURES
     ============================================================ */

  balance = 0;
  income = 0;
  expense = 0;
  savingsRate = 0;

  displayBalance = 0;
  displayIncome = 0;
  displayExpense = 0;

  /* ============================================================
     MONTH
     ============================================================ */

  months = [
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep'
  ];

  selectedMonth =
    this.months[this.months.length - 1];

  monthPickerOpen = false;

  /* ============================================================
     FLOW CHART
     ============================================================ */

  private trend: number[] = [];

  flowLinePath = '';
  flowAreaPath = '';

  /* ============================================================
     CATEGORIES
     ============================================================ */

  categories: CategorySpend[] = [];

  donutGradient = '';

  /* ============================================================
     BUDGETS
     ============================================================ */

  budgets: Budget[] = [];

  animateBars = false;

  /* ============================================================
     TRANSACTIONS
     ============================================================ */

  transactions: Transaction[] = [];

  /* ============================================================
     QUICK ADD
     ============================================================ */

  fabOpen = false;

  fabActions: QuickAddAction[] = [
    {
      label: 'Add expense',
      icon: '−'
    },
    {
      label: 'Add income',
      icon: '+'
    },
    {
      label: 'Set budget',
      icon: '◔'
    }
  ];

  profileMenuOpen = false;

  /* ============================================================
     CONSTRUCTOR
     ============================================================ */

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  get userInitials(): string {
    return this.user?.name
      ?.split(' ')
      .filter(Boolean)
      .map(name => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '--';
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  ngOnInit(): void {

    this.loadDashboard();
  }

  /* ============================================================
     LOAD DASHBOARD
     ============================================================ */

  private loadDashboard(): void {

    this.loadingUser = true;
    this.loadingDashboard = true;
    this.errorMessage = '';

    /*
     * First get authenticated user.
     *
     * The JWT is automatically sent as an HttpOnly cookie.
     */

    this.authService.getMe().subscribe({

      next: user => {

        this.user = user;
        this.loadingUser = false;

        this.loadTransactions();
      },

      error: error => {

        console.error(
          'Failed to load authenticated user',
          error
        );

        this.loadingUser = false;
        this.loadingDashboard = false;

        this.errorMessage =
          'Unable to authenticate user. Please login again.';

        this.cdr.markForCheck();
      }

    });
  }

  /* ============================================================
     LOAD TRANSACTIONS
     ============================================================ */

  private loadTransactions(): void {

    this.transactionService
      .getTransactions()
      .subscribe({

        next: transactions => {

          this.transactions = transactions;

          this.calculateDashboard();

          this.loadingDashboard = false;

          this.cdr.markForCheck();
        },

        error: error => {

          console.error(
            'Failed to load transactions',
            error
          );

          this.loadingDashboard = false;

          this.errorMessage =
            'Unable to load transactions.';

          this.cdr.markForCheck();
        }

      });
  }

  /* ============================================================
     CALCULATE DASHBOARD
     ============================================================ */

  private calculateDashboard(): void {

    /*
     * Calculate total income.
     */

    this.income =
      this.transactions

        .filter(
          transaction =>
            transaction.type === 'INCOME'
        )

        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    /*
     * Calculate total expense.
     */

    this.expense =
      this.transactions

        .filter(
          transaction =>
            transaction.type === 'EXPENSE'
        )

        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    /*
     * Current balance.
     */

    this.balance =
      this.income - this.expense;

    /*
     * Savings rate.
     */

    this.savingsRate =
      this.income > 0
        ? Math.round(
            ((this.income - this.expense)
              / this.income) * 100
          )
        : 0;

    /*
     * Category breakdown.
     */

    this.calculateCategorySpend();

    /*
     * Flow chart.
     */

    this.buildTrend();

    /*
     * Existing animations.
     */

    this.displayBalance = 0;
    this.displayIncome = 0;
    this.displayExpense = 0;

    this.animateCounter(
      this.balance,
      1400,
      value => {
        this.displayBalance = value;
        this.cdr.markForCheck();
      },
      150
    );

    this.animateCounter(
      this.income,
      1100,
      value => {
        this.displayIncome = value;
        this.cdr.markForCheck();
      },
      350
    );

    this.animateCounter(
      this.expense,
      1100,
      value => {
        this.displayExpense = value;
        this.cdr.markForCheck();
      },
      450
    );

    setTimeout(() => {

      this.animateBars = true;

      this.cdr.markForCheck();

    }, 650);
  }

  /* ============================================================
     CATEGORY SPENDING
     ============================================================ */

  private calculateCategorySpend(): void {

    const expenses =
      this.transactions.filter(
        transaction =>
          transaction.type === 'EXPENSE'
      );

    const grouped =
      new Map<string, number>();

    for (const transaction of expenses) {

      const categoryName =
        transaction.category?.name ||
        'Other';

      const existing =
        grouped.get(categoryName) || 0;

      grouped.set(
        categoryName,
        existing + Number(transaction.amount)
      );
    }

    const totalExpense =
      expenses.reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

    this.categories =
      Array.from(grouped.entries())

        .map(([name, amount]) => {

          const percent =
            totalExpense > 0
              ? Math.round(
                  (amount / totalExpense) * 100
                )
              : 0;

          return {
            name,
            amount,
            percent,
            color: this.getCategoryColor(name),
            emoji: this.getCategoryEmoji(name)
          };
        })

        .sort(
          (a, b) =>
            b.amount - a.amount
        )

        .slice(0, 5);

    this.donutGradient =
      this.buildDonutGradient();
  }

  /* ============================================================
     CATEGORY COLOR
     ============================================================ */

  private getCategoryColor(
    category: string
  ): string {

    const colors: Record<string, string> = {

      'Food & Dining': '#0F6E5C',

      'Shopping': '#B04A2C',

      'Transport': '#C7A23A',

      'Bills & Utilities': '#55645D',

      'Entertainment': '#6B4E71'

    };

    return colors[category] || '#7A807C';
  }

  /* ============================================================
     CATEGORY EMOJI
     ============================================================ */

  private getCategoryEmoji(
    category: string
  ): string {

    const emojis: Record<string, string> = {

      'Food & Dining': '🍜',

      'Shopping': '🛍️',

      'Transport': '🚕',

      'Bills & Utilities': '💡',

      'Entertainment': '🎬'

    };

    return emojis[category] || '💰';
  }

  /* ============================================================
     FLOW TREND
     ============================================================ */

  private buildTrend(): void {

    /*
     * For now we calculate cumulative balance
     * from the current transaction list.
     *
     * Later we can replace this with a dedicated
     * backend analytics endpoint.
     */

    const sorted =
      [...this.transactions].sort(
        (a, b) =>
          new Date(a.transactionDate).getTime()
          -
          new Date(b.transactionDate).getTime()
      );

    let runningBalance = 0;

    this.trend =
      sorted.map(transaction => {

        if (transaction.type === 'INCOME') {

          runningBalance +=
            Number(transaction.amount);

        } else {

          runningBalance -=
            Number(transaction.amount);
        }

        return runningBalance;
      });

    /*
     * Keep the chart from being empty.
     */

    if (this.trend.length === 0) {

      this.trend = [0];
    }

    this.buildFlowPaths();
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */

  selectNav(index: number): void {

    this.activeNavIndex = index;
    this.mobileNavOpen = false;
  }

  toggleSidebar(): void {

    this.sidebarCollapsed =
      !this.sidebarCollapsed;
  }

  toggleMobileNav(): void {

    this.mobileNavOpen =
      !this.mobileNavOpen;
  }

  /* ============================================================
     PROFILE
     ============================================================ */

  toggleProfileMenu(
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.profileMenuOpen =
      !this.profileMenuOpen;

    this.fabOpen = false;
  }

  /* ============================================================
     FAB
     ============================================================ */

  toggleFab(
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.fabOpen =
      !this.fabOpen;

    this.profileMenuOpen = false;
  }

  /* ============================================================
     MONTH PICKER
     ============================================================ */

  toggleMonthPicker(
    event: MouseEvent
  ): void {

    event.stopPropagation();

    this.monthPickerOpen =
      !this.monthPickerOpen;
  }

  pickMonth(
    month: string
  ): void {

    this.selectedMonth =
      month;

    this.monthPickerOpen =
      false;

    /*
     * Later this should reload dashboard
     * data for the selected month.
     */
  }

  /* ============================================================
     CLOSE MENUS
     ============================================================ */

  @HostListener('document:click')
  closeAllMenus(): void {

    this.profileMenuOpen = false;
    this.fabOpen = false;
    this.monthPickerOpen = false;
  }

  /* ============================================================
     BUDGET
     ============================================================ */

  budgetPercent(
    budget: Budget
  ): number {

    if (budget.limit <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (budget.spent / budget.limit) * 100
      ),
      999
    );
  }

  isOverBudget(
    budget: Budget
  ): boolean {

    return budget.spent >
      budget.limit;
  }

  /* ============================================================
     TRACK BY
     ============================================================ */

  trackByLabel =
    (
      _index: number,
      item: NavItem
    ) => item.label;

  trackByName =
    (
      _index: number,
      item: CategorySpend | Budget
    ) => item.name;

  trackById =
    (
      _index: number,
      item: Transaction
    ) => item.id;

  /* ============================================================
     DONUT
     ============================================================ */

  private buildDonutGradient(): string {

    if (!this.categories.length) {
      return '';
    }

    let cumulative = 0;

    const stops =
      this.categories.map(category => {

        const start =
          cumulative;

        cumulative +=
          category.percent;

        return `${category.color} ${start}% ${cumulative}%`;
      });

    return `conic-gradient(${stops.join(', ')})`;
  }

  /* ============================================================
     FLOW PATHS
     ============================================================ */

  private buildFlowPaths(): void {

    if (!this.trend.length) {
      this.flowLinePath = '';
      this.flowAreaPath = '';
      return;
    }

    const width = 300;
    const height = 96;
    const padY = 10;

    const min =
      Math.min(...this.trend);

    const max =
      Math.max(...this.trend);

    const range =
      max - min || 1;

    const points =
      this.trend.map(
        (value, index) => {

          const x =
            this.trend.length === 1
              ? width / 2
              : (
                  index /
                  (this.trend.length - 1)
                ) * width;

          const y =
            height -
            padY -
            (
              (value - min) /
              range
            ) *
            (
              height -
              padY * 2
            );

          return {
            x,
            y
          };
        }
      );

    this.flowLinePath =
      this.smoothPath(points);

    const last =
      points[points.length - 1];

    const first =
      points[0];

    this.flowAreaPath =
      `${this.flowLinePath}
       L ${last.x} ${height}
       L ${first.x} ${height}
       Z`;
  }

  /* ============================================================
     SMOOTH PATH
     ============================================================ */

  private smoothPath(
    points: {
      x: number;
      y: number;
    }[]
  ): string {

    if (!points.length) {
      return '';
    }

    if (points.length === 1) {

      return `
        M ${points[0].x}
          ${points[0].y}
      `;
    }

    let d =
      `M ${points[0].x}
         ${points[0].y}`;

    for (
      let i = 0;
      i < points.length - 1;
      i++
    ) {

      const p0 =
        points[i];

      const p1 =
        points[i + 1];

      const midX =
        (p0.x + p1.x) / 2;

      const midY =
        (p0.y + p1.y) / 2;

      d +=
        ` Q ${p0.x} ${p0.y}
            ${midX} ${midY}`;
    }

    const lastPoint =
      points[points.length - 1];

    d +=
      ` T ${lastPoint.x}
          ${lastPoint.y}`;

    return d;
  }

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */

  private animateCounter(
    target: number,
    durationMs: number,
    onUpdate: (value: number) => void,
    delay = 0
  ): void {

    setTimeout(() => {

      const start =
        performance.now();

      const tick =
        (now: number) => {

          const elapsed =
            now - start;

          const progress =
            Math.min(
              elapsed / durationMs,
              1
            );

          const eased =
            1 -
            Math.pow(
              1 - progress,
              3
            );

          onUpdate(
            Math.round(
              target * eased
            )
          );

          if (progress < 1) {

            requestAnimationFrame(
              tick
            );
          }
        };

      requestAnimationFrame(
        tick
      );

    }, delay);
  }

  /* ============================================================
     LOGOUT
     ============================================================ */

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next: () => {

          window.location.href =
            '/login';

        },

        error: error => {

          console.error(
            'Logout failed',
            error
          );

        }

      });
  }
}