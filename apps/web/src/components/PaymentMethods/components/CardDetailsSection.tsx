// Enhanced Card Details Section Component
import { TextField, SelectField } from '@/components/Forms/FormField';
import { type UsePaymentMethodFormReturn } from '@/hooks/forms/usePaymentMethodForm';
import { type Database } from '@afp/shared-types';

// =====================================================================================
// TYPES
// =====================================================================================

type AccountType = Database['public']['Enums']['account_type'];

interface CardDetailsSectionProps {
  form: UsePaymentMethodFormReturn;
  accountType?: AccountType;
}

// =====================================================================================
// CONSTANTS
// =====================================================================================

const CARD_BRAND_OPTIONS = [
  { value: 'visa', label: '💳 Visa' },
  { value: 'mastercard', label: '💳 Mastercard' },
  { value: 'amex', label: '💳 American Express' },
  { value: 'discover', label: '💳 Discover' },
  { value: 'other', label: '💳 Otra' },
];

// =====================================================================================
// HELPER FUNCTIONS
// =====================================================================================

const getAccountLabels = (accountType?: AccountType) => {
  const labelMap = {
    checking_account: {
      title: 'Detalles de la Cuenta Corriente',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu cuenta',
    },
    savings_account: {
      title: 'Detalles de la Cuenta de Ahorros',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu cuenta',
    },
    digital_wallet: {
      title: 'Detalles de la Billetera Digital',
      digitLabel: 'Últimos 4 Dígitos del ID',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu billetera',
    },
    investment_account: {
      title: 'Detalles de la Cuenta de Inversión',
      digitLabel: 'Últimos 4 Dígitos de la Cuenta',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu cuenta',
    },
    credit_card: {
      title: 'Detalles de la Tarjeta de Crédito',
      digitLabel: 'Últimos 4 Dígitos',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu tarjeta',
    },
    debit_card: {
      title: 'Detalles de la Tarjeta de Débito',
      digitLabel: 'Últimos 4 Dígitos',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura tu tarjeta',
    },
  };

  return (
    labelMap[accountType as keyof typeof labelMap] || {
      title: 'Detalles de Identificación',
      digitLabel: 'Últimos 4 Dígitos',
      placeholder: '1234',
      helpText: 'Solo números, para identificar de forma segura',
    }
  );
};

// =====================================================================================
// COMPONENT
// =====================================================================================

export function CardDetailsSection({
  form,
  accountType,
}: CardDetailsSectionProps) {
  const isCard = accountType === 'credit_card' || accountType === 'debit_card';
  const labels = getAccountLabels(accountType);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <h4 className='font-medium'>{labels.title}</h4>
        {isCard && (
          <span className='text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded'>
            Tarjeta
          </span>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Last Four Digits */}
        <TextField
          control={form.control}
          name='last_four_digits'
          label={labels.digitLabel}
          placeholder={labels.placeholder}
          description={labels.helpText}
          maxLength={4}
          required
          type='text'
        />

        {/* Card Brand - Only for cards */}
        {isCard && (
          <SelectField
            control={form.control}
            name='card_brand'
            label='Marca de la Tarjeta'
            options={CARD_BRAND_OPTIONS}
            placeholder='Seleccionar marca'
            description='Marca o tipo de tarjeta'
            required
          />
        )}
      </div>

      {/* Additional Information */}
      <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3'>
        <div className='flex items-start gap-2'>
          <div className='text-blue-600 dark:text-blue-400 mt-0.5'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='text-sm text-blue-800 dark:text-blue-200'>
            <p className='font-medium'>Información de Seguridad</p>
            <p>
              Solo almacenamos los últimos 4 dígitos para identificación. Nunca
              guardamos números completos de {isCard ? 'tarjeta' : 'cuenta'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================================
// CARD BRAND SELECTOR COMPONENT
// =====================================================================================

interface CardBrandSelectorProps {
  form: UsePaymentMethodFormReturn;
  required?: boolean;
}

export function CardBrandSelector({
  form,
  required = false,
}: CardBrandSelectorProps) {
  const currentBrand = form.watch('card_brand');

  return (
    <div className='space-y-3'>
      <SelectField
        control={form.control}
        name='card_brand'
        label='Marca de la Tarjeta'
        options={CARD_BRAND_OPTIONS}
        placeholder='Seleccionar marca de tarjeta'
        required={required}
      />

      {/* Brand Preview */}
      {currentBrand && (
        <div className='flex items-center gap-2 p-2 bg-muted rounded-md'>
          <span className='text-lg'>
            {
              CARD_BRAND_OPTIONS.find(
                opt => opt.value === currentBrand
              )?.label.split(' ')[0]
            }
          </span>
          <span className='text-sm text-muted-foreground'>
            {CARD_BRAND_OPTIONS.find(opt => opt.value === currentBrand)
              ?.label.split(' ')
              .slice(1)
              .join(' ')}
          </span>
        </div>
      )}
    </div>
  );
}

// =====================================================================================
// ACCOUNT IDENTIFIER COMPONENT
// =====================================================================================

interface AccountIdentifierProps {
  form: UsePaymentMethodFormReturn;
  accountType: AccountType;
}

export function AccountIdentifier({
  form,
  accountType,
}: AccountIdentifierProps) {
  const labels = getAccountLabels(accountType);
  const currentValue = form.watch('last_four_digits');

  return (
    <div className='space-y-3'>
      <TextField
        control={form.control}
        name='last_four_digits'
        label={labels.digitLabel}
        placeholder={labels.placeholder}
        description={labels.helpText}
        maxLength={4}
        required
        type='text'
      />

      {/* Validation Feedback */}
      {currentValue && (
        <div className='text-sm'>
          {/^\d{4}$/.test(currentValue) ? (
            <div className='flex items-center gap-1 text-green-600 dark:text-green-400'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Formato válido</span>
            </div>
          ) : (
            <div className='flex items-center gap-1 text-amber-600 dark:text-amber-400'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span>
                Debe ser exactamente 4 dígitos ({currentValue.length}/4)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
