/**
 * Pay2Nature Widget Core Class
 * Framework-agnostic implementation that can be used with any framework
 */

export interface Pay2NatureWidgetOptions {
    widgetToken: string;
    baseUrl: string;
    container?: HTMLElement | string | null;
    onContribution?: (data: ContributionData) => void;
    onToggle?: (isEnabled: boolean) => void;
    onError?: (error: Error) => void;
}

export interface ContributionData {
    amount: number;
    currency: string;
    paymentUrl?: string;
    projectName?: string;
    paymentToken?: string;
}

export interface WidgetConfig {
    currency: string;
    currencySymbol: string;
    minAmount: number;
    maxAmount: number;
    defaultAmount: number;
    activeProjectName: string | null;
    hasActiveProjects: boolean;
}

export class Pay2NatureWidget {
    private baseUrl: string;
    private widgetToken: string;
    private container: HTMLElement | null;
    private shadowRoot: ShadowRoot | null = null;
    private isEnabled: boolean = true;
    private selectedAmount: number = 0;
    private customAmount: string = "";
    private isCustom: boolean = false;
    private isLoading: boolean = true;
    private config: WidgetConfig | null = null;
    private isProcessing: boolean = false;
    private mobileMoneyNumber: string = "";
    private mobileMoneyName: string = "";
    private mobileMoneyProvider: string = "";
    private mobileMoneyAnonymous: boolean = false;
    private showMobileMoneyPrompt: boolean = false;
    private mobileMoneyModal: any = null;

    // Default fallback values
    private currency: string = "USD";
    private currencySymbol: string = "$";
    private minAmount: number = 0.5;
    private maxAmount: number = 5.0;
    private defaultAmount: number = 1.0;
    private predefinedAmounts: number[] = [];
    private activeProjectName: string | null = null;

    // Event callbacks
    private onContribution: (data: ContributionData) => void;
    private onToggle: (isEnabled: boolean) => void;
    private onError: (error: Error) => void;

    constructor(options: Pay2NatureWidgetOptions) {
        if (!options.baseUrl || !options.widgetToken) {
            throw new Error("Pay2Nature: widgetToken and baseUrl are required");
        }

        this.baseUrl = options.baseUrl;
        this.widgetToken = options.widgetToken;
        this.container = this.resolveContainer(options.container);
        this.onContribution = options.onContribution || (() => {});
        this.onToggle = options.onToggle || (() => {});
        this.onError = options.onError || ((error) => console.error(error));

        // Initialize widget asynchronously
        this.init();
        this.loadMobileMoneyModal();
    }

    private resolveContainer(
        container: HTMLElement | string | null | undefined
    ): HTMLElement | null {
        if (!container) {
            const fallback = document.getElementById("pay2nature-widget");
            return fallback;
        }

        if (typeof container === "string") {
            return document.querySelector(container) as HTMLElement;
        }

        return container;
    }

    private createShadowDOM(): void {
        if (!this.container) return;

        // Check if shadow root already exists on the container
        // This can happen in React StrictMode which double-invokes effects
        if (this.container.shadowRoot) {
            // Reuse existing shadow root and clear it
            this.shadowRoot = this.container.shadowRoot;
            this.shadowRoot.innerHTML = "";
            return;
        }

        // Create new shadow root
        try {
            // Check again right before attaching (race condition protection)
            const existingShadowBeforeAttach = this.container.shadowRoot;
            if (existingShadowBeforeAttach) {
                this.shadowRoot = existingShadowBeforeAttach as ShadowRoot;
                this.shadowRoot.innerHTML = "";
                return;
            }

            this.shadowRoot = this.container.attachShadow({
                mode: "closed",
            });
        } catch (error) {
            // If shadow DOM creation fails, check if one was created by another instance
            const existingShadowRoot = this.container.shadowRoot;
            if (existingShadowRoot) {
                this.shadowRoot = existingShadowRoot as ShadowRoot;
                this.shadowRoot.innerHTML = "";
            } else {
                console.error(
                    "Pay2Nature: Failed to create shadow DOM:",
                    error
                );
                // Fallback: if shadow DOM creation fails, we'll use the container directly
                // This shouldn't happen, but provides a safety net
            }
        }
    }

    async init(): Promise<void> {
        if (!this.container) {
            console.error(
                "Pay2Nature: Container element not provided to widget constructor"
            );
            return;
        }

        this.createShadowDOM();

        if (!this.shadowRoot) {
            console.error("Pay2Nature: Failed to create shadow DOM");
            return;
        }

        this.renderLoading();

        try {
            await this.fetchConfiguration();

            if (!this.config?.hasActiveProjects) {
                this.renderError(
                    "Configuration Error: No active projects found. Please ensure you have at least one active project before using the widget."
                );
                return;
            }

            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error("Pay2Nature Widget initialization failed:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            this.renderError(errorMessage);
            this.onError(new Error(errorMessage));
        }
    }

    private async fetchConfiguration(): Promise<void> {
        const url = `${this.baseUrl}/api/widget/${this.widgetToken}/config`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(
                        `Widget configuration not found for token: ${this.widgetToken}`
                    );
                }
                throw new Error(
                    `Failed to fetch widget configuration: ${response.status} ${response.statusText}`
                );
            }

            const configData = await response.json();
            this.config = configData as WidgetConfig;

            if (!this.config) {
                throw new Error(
                    `No configuration found for widget token: ${this.widgetToken}`
                );
            }

            // Update widget properties from fetched config
            this.currency = this.config.currency || "USD";
            this.currencySymbol = this.config.currencySymbol || "$";
            this.minAmount = parseFloat(
                String(this.config.minAmount || "0.50")
            );
            this.maxAmount = parseFloat(
                String(this.config.maxAmount || "5.00")
            );
            this.defaultAmount = parseFloat(
                String(this.config.defaultAmount || "1.00")
            );
            this.activeProjectName = this.config.activeProjectName || null;

            this.selectedAmount = this.defaultAmount;

            // Generate predefined amounts
            const step = (this.maxAmount - this.minAmount) / 4;
            this.predefinedAmounts = [
                this.minAmount,
                this.minAmount + step,
                this.minAmount + step * 2,
                this.minAmount + step * 3,
                this.maxAmount,
            ].map((amount) => Math.round(amount * 100) / 100);

            this.isLoading = false;
        } catch (error) {
            this.isLoading = false;
            console.error("Failed to fetch widget configuration:", error);
            throw error;
        }
    }

    private getStyles(): string {
        return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .pay2nature-widget {
          border-radius: 8px;
          border: 1px solid #bbf7d0;
          padding: 16px;
          margin: 8px 0;
          max-width: 400px;
          box-sizing: border-box;
          background-color: #f0fdf4;
          position: relative;
        }
        .pay2nature-widget * {
          box-sizing: border-box;
        }
        .p2n-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .p2n-logo {
          width: auto;
          height: 3rem;
          margin-right: 12px;
          object-fit: contain;
          border-radius: 0.5rem;
        }
        .p2n-brand {
          display: flex;
          flex-direction: column;
        }
        .p2n-title {
          font-size: 18px;
          font-weight: bold;
          color: #166534;
        }
        .p2n-subtitle {
          font-size: 12px;
          color: #6b7280;
        }
        .p2n-description {
          font-size: 14px;
          color: #374151;
          margin-bottom: 16px;
          line-height: 1.4;
        }
        .p2n-amounts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-bottom: 16px;
        }
        .p2n-amount {
          height: 32px;
          padding: 8px 12px;
          font-size: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .p2n-amount:hover {
          border-color: #16a34a;
          color: #16a34a;
        }
        .p2n-amount.selected {
          background-color: #16a34a;
          color: white;
          border-color: #16a34a;
        }
        .p2n-custom-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .p2n-custom-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .p2n-custom {
          width: 80px;
          height: 32px;
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          outline: none;
        }
        .p2n-custom:focus {
          border-color: #16a34a;
        }
        .p2n-contribute {
          width: 100%;
          padding: 12px;
          font-size: 14px;
          background-color: #16a34a;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s;
        }
        .p2n-contribute:hover {
          background-color: #15803d;
        }
        .p2n-contribute:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
      </style>
    `;
    }

    private renderLoading(): void {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="pay2nature-widget">
        <div class="p2n-header">
          <div class="p2n-logo">🌱</div>
          <div class="p2n-title">Pay2Nature</div>
        </div>
        <div style="text-align: center; padding: 20px; color: #374151;">
          <div style="margin-bottom: 8px;">Loading widget configuration...</div>
          <div style="font-size: 12px; color: #6b7280;">Please wait</div>
        </div>
      </div>
    `;
    }

    private renderError(message: string): void {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="pay2nature-widget" style="border-color: #fca5a5; background-color: #fef2f2;">
        <div class="p2n-header">
          <div class="p2n-logo">🌱</div>
          <div class="p2n-title">Pay2Nature</div>
        </div>
        <div style="text-align: center; padding: 20px; color: #dc2626;">
          <div style="margin-bottom: 8px; font-weight: 500;">Configuration Error</div>
          <div style="font-size: 12px; color: #7f1d1d;">${message}</div>
        </div>
      </div>
    `;
    }

    private render(): void {
        if (!this.shadowRoot) return;

        const currentAmount = this.isCustom
            ? parseFloat(this.customAmount) || 0
            : this.selectedAmount;

        this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <div class="pay2nature-widget">
        <div class="p2n-header">
          <img src="https://storage.googleapis.com/cdn-pay2nature/logo-short.jpg" alt="Pay2Nature" class="p2n-logo" />
          <div class="p2n-brand">
            <div class="p2n-title">Pay2Nature</div>
            <div class="p2n-subtitle">Powered by Indelible</div>
          </div>
        </div>
        <p class="p2n-description">
          Add a small contribution to verified nature projects. Your contribution goes directly to conservation efforts${this.activeProjectName ? ` in project <strong>${this.activeProjectName}</strong>` : ""}.
        </p>
        <div class="p2n-content">
          <div class="p2n-amounts">
            ${this.predefinedAmounts
                .map(
                    (amount) => `
              <button class="p2n-amount ${this.selectedAmount === amount && !this.isCustom ? "selected" : ""}" data-amount="${amount}">
                ${this.formatCurrency(amount)}
              </button>
            `
                )
                .join("")}
            <div class="p2n-custom-wrapper">
              <span class="p2n-custom-label">Custom:</span>
              <input type="number" class="p2n-custom" placeholder="0.00"
                     min="${this.minAmount}" step="0.1"
                     value="${this.customAmount}">
            </div>
          </div>
          <button class="p2n-contribute" ${!this.isEnabled || currentAmount < this.minAmount ? "disabled" : ""}>
            Contribute ${this.currencySymbol}${currentAmount.toFixed(2)}
          </button>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        if (!this.shadowRoot) return;

        const amountButtons = this.shadowRoot.querySelectorAll(".p2n-amount");
        const customInput = this.shadowRoot.querySelector(
            ".p2n-custom"
        ) as HTMLInputElement;
        const contributeButton = this.shadowRoot.querySelector(
            ".p2n-contribute"
        ) as HTMLButtonElement;

        if (!customInput || !contributeButton) return;

        // Amount selection
        amountButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const amount = parseFloat(
                    (e.target as HTMLElement).dataset.amount || "0"
                );
                this.selectAmount(amount, false);
                this.customAmount = "";
                if (customInput) customInput.value = "";
                this.updateDisplayedAmount();
                this.updatePresetButtonStates();
            });
        });

        // Custom amount input
        customInput.addEventListener("input", (e) => {
            const value = (e.target as HTMLInputElement).value;
            this.customAmount = value;
            const numValue = parseFloat(value);

            if (!isNaN(numValue) && numValue >= this.minAmount) {
                this.selectAmount(numValue, true);
            } else {
                this.isCustom = value !== "";
            }

            this.updateDisplayedAmount();
            this.updatePresetButtonStates();
        });

        // Contribute button
        contributeButton.addEventListener("click", (e) => {
            e.preventDefault();
            if (!this.isProcessing) {
                this.handleContribution();
            }
        });
    }

    private selectAmount(amount: number, isCustom: boolean): void {
        this.selectedAmount = amount;
        this.isCustom = isCustom;
    }

    private formatCurrency(amount: number): string {
        return `${this.currencySymbol}${amount.toFixed(2)}`;
    }

    private updateDisplayedAmount(): void {
        if (!this.shadowRoot) return;

        const currentAmount = this.isCustom
            ? parseFloat(this.customAmount) || 0
            : this.selectedAmount;

        const contributeButton = this.shadowRoot.querySelector(
            ".p2n-contribute"
        ) as HTMLButtonElement;
        if (contributeButton) {
            const isValidAmount = currentAmount >= this.minAmount;
            contributeButton.disabled = !this.isEnabled || !isValidAmount;

            if (isValidAmount) {
                contributeButton.innerHTML = `Contribute ${this.formatCurrency(currentAmount)}`;
            } else {
                contributeButton.innerHTML = `Minimum ${this.formatCurrency(this.minAmount)}`;
            }
        }
    }

    private updatePresetButtonStates(): void {
        if (!this.shadowRoot) return;

        const amountButtons = this.shadowRoot.querySelectorAll(".p2n-amount");
        amountButtons.forEach((button) => {
            const amount = parseFloat(
                button.getAttribute("data-amount") || "0"
            );
            if (amount === this.selectedAmount && !this.isCustom) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    }

    private async handleContribution(): Promise<void> {
        if (this.isProcessing) return;

        const amount = this.isCustom
            ? parseFloat(this.customAmount)
            : this.selectedAmount;

        if (amount < this.minAmount) {
            this.onError(
                new Error(
                    `Amount must be at least ${this.formatCurrency(this.minAmount)}`
                )
            );
            return;
        }

        if (this.config?.currency === "GHS") {
            // Mobile money flow
            if (this.mobileMoneyModal) {
                this.mobileMoneyModal.show({
                    showAnonymous: true,
                    anonymousChecked: this.mobileMoneyAnonymous,
                    nameValue: this.mobileMoneyName,
                    numberValue: this.mobileMoneyNumber,
                    providerValue: this.mobileMoneyProvider,
                });
                this.setupMobileMoneyModalCallbacks();
            } else {
                console.error("Mobile money modal not loaded yet");
            }
            return;
        } else {
            // Stripe flow
            await this.stripeCreatePaymentLink(amount);
        }
    }

    private async stripeCreatePaymentLink(amount: number): Promise<void> {
        try {
            this.isProcessing = true;

            if (!this.shadowRoot) return;

            const contributeButton = this.shadowRoot.querySelector(
                ".p2n-contribute"
            ) as HTMLButtonElement;
            const originalHTML = contributeButton?.innerHTML || "";
            if (contributeButton) {
                contributeButton.disabled = true;
                contributeButton.innerHTML = "Processing...";
            }

            const response = await fetch(
                `${this.baseUrl}/api/widget/${this.widgetToken}/stripe/create-payment-link`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ amount }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();

            window.open(result.paymentUrl, "_blank");

            this.onContribution({
                amount,
                currency: this.currency,
                paymentUrl: result.paymentUrl,
                projectName: result.projectName,
            });

            if (contributeButton) {
                const successMessage = result.projectName
                    ? `✓ Opening payment for ${result.projectName}...`
                    : `✓ Opening payment...`;
                contributeButton.innerHTML = successMessage;
                contributeButton.style.backgroundColor = "#10b981";

                setTimeout(() => {
                    this.isProcessing = false;
                    if (contributeButton) {
                        contributeButton.disabled = false;
                        contributeButton.innerHTML = originalHTML;
                        contributeButton.style.backgroundColor = "";
                    }
                }, 3000);
            }
        } catch (error) {
            console.error("Pay2Nature contribution error:", error);
            this.onError(
                error instanceof Error ? error : new Error(String(error))
            );

            this.isProcessing = false;

            if (this.shadowRoot) {
                const contributeButton = this.shadowRoot.querySelector(
                    ".p2n-contribute"
                ) as HTMLButtonElement;
                if (contributeButton) {
                    contributeButton.disabled = false;
                    contributeButton.innerHTML = "Payment Error - Try Again";
                    contributeButton.style.backgroundColor = "#ef4444";

                    setTimeout(() => {
                        contributeButton.style.backgroundColor = "";
                        this.updateDisplayedAmount();
                    }, 4000);
                }
            }
        }
    }

    private loadMobileMoneyModal(): void {
        if ((window as any).MobileMoneyModal) {
            this.mobileMoneyModal = new (window as any).MobileMoneyModal();
            return;
        }

        const script = document.createElement("script");
        script.src = `${this.baseUrl}/widget/mobile-money-modal.js`;
        script.onload = () => {
            this.mobileMoneyModal = new (window as any).MobileMoneyModal();
        };
        script.onerror = () => {
            console.error("Failed to load mobile money modal script");
        };
        document.head.appendChild(script);
    }

    private setupMobileMoneyModalCallbacks(): void {
        if (!this.mobileMoneyModal) return;

        this.mobileMoneyModal.setCallbacks({
            onNameChange: (name: string) => {
                this.mobileMoneyName = name;
            },
            onNumberChange: (number: string) => {
                this.mobileMoneyNumber = number;
            },
            onProviderChange: (provider: string) => {
                this.mobileMoneyProvider = provider;
            },
            onProceed: async (data: any) => {
                this.mobileMoneyName = data.name;
                this.mobileMoneyNumber = data.number;
                this.mobileMoneyProvider = data.provider;
                this.mobileMoneyAnonymous = data.isAnonymous;

                const amount = this.isCustom
                    ? parseFloat(this.customAmount)
                    : this.selectedAmount;

                this.mobileMoneyModal.hide();

                await this.initiateMobileMoneyPayment(
                    amount,
                    data.number,
                    data.provider,
                    data.name
                );
            },
            onHide: () => {
                this.showMobileMoneyPrompt = false;
                this.mobileMoneyNumber = "";
                this.mobileMoneyName = "";
                this.mobileMoneyProvider = "";
                this.mobileMoneyAnonymous = false;
            },
        });
    }

    private async initiateMobileMoneyPayment(
        amount: number,
        mobileNumber: string,
        mobileProvider: string,
        customerName: string | null
    ): Promise<void> {
        try {
            this.isProcessing = true;

            if (this.shadowRoot) {
                const contributeButton = this.shadowRoot.querySelector(
                    ".p2n-contribute"
                ) as HTMLButtonElement;
                const originalHTML = contributeButton?.innerHTML || "";
                if (contributeButton) {
                    contributeButton.disabled = true;
                    contributeButton.innerHTML = "Processing...";
                }
            }

            const requestBody = {
                amount: parseFloat(String(amount)),
                mobileNumber,
                mobileProvider,
                customerName,
            };

            const response = await fetch(
                `${this.baseUrl}/api/widget/${this.widgetToken}/mobileMoney/initiate-payment`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();

            this.onContribution({
                amount,
                currency: this.currency,
                paymentToken: result.paymentToken,
            });

            this.isProcessing = false;

            if (this.shadowRoot) {
                const contributeButton = this.shadowRoot.querySelector(
                    ".p2n-contribute"
                ) as HTMLButtonElement;
                if (contributeButton) {
                    contributeButton.disabled = false;
                    contributeButton.innerHTML = "Processing...";
                    contributeButton.style.backgroundColor = "";
                }
            }
        } catch (error) {
            console.error("Pay2Nature contribution error:", error);
            this.onError(
                error instanceof Error ? error : new Error(String(error))
            );

            this.isProcessing = false;

            if (this.shadowRoot) {
                const contributeButton = this.shadowRoot.querySelector(
                    ".p2n-contribute"
                ) as HTMLButtonElement;
                if (contributeButton) {
                    contributeButton.disabled = false;
                    contributeButton.innerHTML = "Payment Error - Try Again";
                    contributeButton.style.backgroundColor = "#ef4444";

                    setTimeout(() => {
                        contributeButton.style.backgroundColor = "";
                        this.updateDisplayedAmount();
                    }, 4000);
                }
            }
        }
    }

    // Public API methods
    public destroy(): void {
        if (this.shadowRoot) {
            // Clear the shadow root content instead of trying to remove it
            try {
                this.shadowRoot.innerHTML = "";
            } catch (error) {
                // Ignore errors when clearing (shadow root might already be detached)
                console.warn("Pay2Nature: Error clearing shadow root:", error);
            }
            this.shadowRoot = null;
        }
        // Note: We don't remove the shadow root itself as it's attached to the container
        // and removing it would cause issues if the widget is re-initialized
        // The shadow root will be reused by new instances if the container is reused
    }

    public updateConfig(config: Partial<WidgetConfig>): void {
        if (this.config) {
            this.config = { ...this.config, ...config };
            this.render();
        }
    }
}
